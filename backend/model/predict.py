import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime
from .pipeline import build_pipeline


def predict_stockout(input_file):
    # 1. Load model
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "demand_forecast_model.pkl")
    model = joblib.load(MODEL_PATH)

    # 2. Process dataset
    final_df = build_pipeline(input_file)

    features = [
        'net_stock', 'total_quantity', 'active_days', 'avg_daily_sales',
        'month', 'dayofweek', 'quarter',
        'avg_sales_per_month', 'category_encoded', 'reorder_threshold'
    ]

    X_new = final_df[features].fillna(0)

    # 3. Predict days to stockout FROM last inventory date
    predicted_days_from_last = model.predict(X_new)

    # 4. Clamp negative values
    predicted_days_from_last = np.maximum(predicted_days_from_last, 0).astype(int)

    # 5. Calculate predicted stockout date
    predicted_stockout_date = (
        final_df["last_inventory_date"] +
        pd.to_timedelta(predicted_days_from_last, unit="D")
    )

    # 6. Calculate DAYS LEFT from TODAY (IMPORTANT FIX)
    today = pd.Timestamp(datetime.today().date())

    days_left = (predicted_stockout_date - today).dt.days
    days_left = days_left.clip(lower=0)

    # 7. Build final result
    pred_df = pd.DataFrame({
        "Product_id": final_df["product_id"],
        "Product_name": final_df.get("product_name", "Unknown"),
        "Category": final_df.get("category", "Unknown"),
        "Days_left_to_stockout": days_left,
        "Predicted_stockout_date": predicted_stockout_date
    })

    return pred_df