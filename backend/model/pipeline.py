import pandas as pd
import numpy as np

def build_pipeline(input_path: str):
    
    if input_path.endswith(".xlsx"):
        df = pd.read_excel(input_path, sheet_name=None)  
    elif input_path.endswith(".csv"):
        single_df = pd.read_csv(input_path)
        df = {"single_sheet": single_df} 
    else:
        raise ValueError("File format not supported. Use .xlsx or .csv")

    if "blinkit_inventory" in df:
        sheet_inventory = df["blinkit_inventory"]
    elif "inventory" in df:
        sheet_inventory = df["inventory"]
    elif "single_sheet" in df:
        sheet_inventory = df["single_sheet"]
    else:
        sheet_inventory = pd.DataFrame()

    if "blinkit_orders" in df:
        sheet_orders = df["blinkit_orders"]
    elif "orders" in df:
        sheet_orders = df["orders"]
    else:
        sheet_orders = pd.DataFrame()

    if "blinkit_order_items" in df:
        sheet_orderitems = df["blinkit_order_items"]
    elif "order_items" in df:
        sheet_orderitems = df["order_items"]
    else:
        sheet_orderitems = pd.DataFrame()

    if "blinkit_products" in df:
        sheet_products = df["blinkit_products"]
    elif "products" in df:
        sheet_products = df["products"]
    else:
        sheet_products = pd.DataFrame()

    if not sheet_inventory.empty and "date" in sheet_inventory.columns:
        sheet_inventory["date"] = pd.to_datetime(sheet_inventory["date"], errors="coerce")
    if not sheet_orders.empty and "order_date" in sheet_orders.columns:
        sheet_orders["order_date"] = pd.to_datetime(sheet_orders["order_date"], errors="coerce")

    if not sheet_orderitems.empty and "quantity" in sheet_orderitems.columns:
        sheet_orderitems = sheet_orderitems[sheet_orderitems["quantity"] >= 0]
    if not sheet_inventory.empty and "stock_received" in sheet_inventory.columns and "damaged_stock" in sheet_inventory.columns:
        sheet_inventory = sheet_inventory[
            (sheet_inventory["stock_received"] >= 0) & (sheet_inventory["damaged_stock"] >= 0)
        ]

    if not sheet_orders.empty and "order_id" in sheet_orders.columns:
        orderitems_with_dates = pd.merge(
            sheet_orderitems,
            sheet_orders[["order_id", "order_date"]],
            on="order_id",
            how="left"
        )
    else:
        orderitems_with_dates = sheet_orderitems.copy()
        orderitems_with_dates["order_date"] = pd.NaT

    stock_received = (
        sheet_inventory.groupby("product_id")["stock_received"].sum()
        if "stock_received" in sheet_inventory else pd.Series(dtype=float)
    )
    damaged_stock = (
        sheet_inventory.groupby("product_id")["damaged_stock"].sum()
        if "damaged_stock" in sheet_inventory else pd.Series(dtype=float)
    )
    net_stock = stock_received - damaged_stock

    total_quantity = (
        orderitems_with_dates.groupby("product_id")["quantity"].sum()
        if "quantity" in orderitems_with_dates else pd.Series(dtype=float)
    )

    active_days = (
        orderitems_with_dates.groupby("product_id")["order_date"].nunique()
        if "order_date" in orderitems_with_dates else pd.Series(dtype=int)
    )

    combined_df = pd.DataFrame({
        "net_stock": net_stock,
        "total_quantity": total_quantity,
        "active_days": active_days
    }).fillna(0)

    combined_df["avg_daily_sales"] = combined_df.apply(
        lambda row: row["total_quantity"] / row["active_days"] if row["active_days"] > 0 else 0,
        axis=1
    )

    if "order_date" in orderitems_with_dates.columns and orderitems_with_dates["order_date"].notna().any():
        orderitems_with_dates["month_year"] = orderitems_with_dates["order_date"].dt.to_period("M")
        monthly_sales = orderitems_with_dates.groupby(["product_id", "month_year"])["quantity"].sum().reset_index()
        avg_monthly_sales = monthly_sales.groupby("product_id")["quantity"].mean()
    else:
        avg_monthly_sales = pd.Series(0, index=combined_df.index)

    combined_df = combined_df.join(avg_monthly_sales.rename("avg_sales_per_month"))

    combined_df["predicted_days"] = combined_df.apply(
        lambda row: row["net_stock"] / row["avg_daily_sales"] if row["avg_daily_sales"] > 0 else 0,
        axis=1
    ).replace([np.inf, -np.inf], 0)

    combined_df["status"] = combined_df["predicted_days"].apply(
        lambda x: "Overstocked" if x >= 100 else ("Understocked" if x < 50 else "Optimal")
    )

    if not sheet_products.empty and "product_id" in sheet_products.columns:
        combined_df = combined_df.join(sheet_products.set_index("product_id"), on="product_id")

    if "date" in sheet_inventory.columns:
        last_inventory_date = sheet_inventory.groupby("product_id")["date"].max()
        combined_df = combined_df.join(last_inventory_date.rename("last_inventory_date"), on="product_id")
        combined_df["dayofweek"] = combined_df["last_inventory_date"].dt.dayofweek
        combined_df["quarter"] = combined_df["last_inventory_date"].dt.quarter
        combined_df["month"] = combined_df["last_inventory_date"].dt.month
    else:
        combined_df["last_inventory_date"] = pd.NaT
        combined_df["dayofweek"] = 0
        combined_df["quarter"] = 0
        combined_df["month"] = 0

    if "category" in combined_df.columns:
        combined_df["category_encoded"] = combined_df["category"].factorize()[0]
    else:
        combined_df["category_encoded"] = 0

    combined_df["reorder_threshold"] = 0.2 * combined_df["avg_sales_per_month"]

    return combined_df.reset_index()