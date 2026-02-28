import pandas as pd
import numpy as np

def build_pipeline(input_path: str):
    # --- STEP 1: LOAD THE DATA ---
    if input_path.endswith(".xlsx"):
        df = pd.read_excel(input_path, sheet_name=None)  
    elif input_path.endswith(".csv"):
        single_df = pd.read_csv(input_path)
        df = {"single_sheet": single_df} 
    else:
        raise ValueError("File format not supported. Use .xlsx or .csv")

    # --- STEP 2: IDENTIFY SHEETS ---
    sheet_inventory = df.get("blinkit_inventory", df.get("inventory", df.get("single_sheet", pd.DataFrame())))
    sheet_orders = df.get("blinkit_orders", df.get("orders", pd.DataFrame()))
    sheet_orderitems = df.get("blinkit_order_items", df.get("order_items", pd.DataFrame()))
    sheet_products = df.get("blinkit_products", df.get("products", pd.DataFrame()))
    sheet_customers = df.get("blinkit_customers", pd.DataFrame())

    # --- STEP 3: PREPROCESSING ---
    if not sheet_inventory.empty and "date" in sheet_inventory.columns:
        sheet_inventory["date"] = pd.to_datetime(sheet_inventory["date"], errors="coerce")
    if not sheet_orders.empty and "order_date" in sheet_orders.columns:
        sheet_orders["order_date"] = pd.to_datetime(sheet_orders["order_date"], errors="coerce")

    # Join orders with customers for region/area
    if not sheet_orders.empty and not sheet_customers.empty:
        orders_with_region = pd.merge(
            sheet_orders, sheet_customers[['customer_id', 'area']], 
            on='customer_id', how='left'
        )
    else:
        orders_with_region = sheet_orders

    # Merge items with orders to get dates and regions
    orderitems_with_dates = pd.merge(
        sheet_orderitems,
        orders_with_region[["order_id", "order_date", "area"]] if "area" in orders_with_region else orders_with_region[["order_id", "order_date"]],
        on="order_id",
        how="left"
    )

    # --- STEP 4: CALCULATE FEATURES ---
    stock_received = sheet_inventory.groupby("product_id")["stock_received"].sum() if "stock_received" in sheet_inventory else pd.Series(0)
    damaged_stock = sheet_inventory.groupby("product_id")["damaged_stock"].sum() if "damaged_stock" in sheet_inventory else pd.Series(0)
    net_stock = stock_received - damaged_stock

    total_quantity = orderitems_with_dates.groupby("product_id")["quantity"].sum()
    active_days = orderitems_with_dates.groupby("product_id")["order_date"].nunique()

    combined_df = pd.DataFrame({
        "net_stock": net_stock,
        "total_quantity": total_quantity,
        "active_days": active_days
    }).fillna(0)

    combined_df["avg_daily_sales"] = combined_df.apply(
        lambda row: row["total_quantity"] / row["active_days"] if row["active_days"] > 0 else 0, axis=1
    )

    # Predicted Days Calculation
    combined_df["predicted_days"] = combined_df.apply(
        lambda row: row["net_stock"] / row["avg_daily_sales"] if row["avg_daily_sales"] > 0 else 0, axis=1
    ).replace([np.inf, -np.inf], 0)

    # Last Inventory Date & Time Features
    if "date" in sheet_inventory.columns:
        last_date = sheet_inventory.groupby("product_id")["date"].max()
        combined_df = combined_df.join(last_date.rename("last_inventory_date"))
        combined_df["dayofweek"] = combined_df["last_inventory_date"].dt.dayofweek
        combined_df["quarter"] = combined_df["last_inventory_date"].dt.quarter
        combined_df["month"] = combined_df["last_inventory_date"].dt.month
    else:
        for col in ["dayofweek", "quarter", "month"]: combined_df[col] = 0

    # Category Encoding
    if not sheet_products.empty:
        combined_df = combined_df.join(sheet_products.set_index("product_id")[["category", "product_name"]])
        combined_df["category_encoded"] = combined_df["category"].factorize()[0]
    
    combined_df["avg_sales_per_month"] = combined_df["avg_daily_sales"] * 30
    combined_df["reorder_threshold"] = 0.2 * combined_df["avg_sales_per_month"]

    # --- STEP 5: REGIONAL TRENDS & SPIKES ---
    daily_sales = orderitems_with_dates.groupby(['area', 'product_id', 'order_date'])['quantity'].sum().reset_index()
    stats = daily_sales.groupby(['area', 'product_id'])['quantity'].agg(['mean', 'std']).reset_index()
    daily_sales = daily_sales.merge(stats, on=['area', 'product_id'])
    daily_sales['z_score'] = (daily_sales['quantity'] - daily_sales['mean']) / daily_sales['std'].replace(0, 1)
    spikes = daily_sales[daily_sales['z_score'] > 3]

    return {
        "final_df": combined_df.fillna(0).reset_index(),
        "spikes": spikes
    }