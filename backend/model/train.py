import joblib
import xgboost as xgb
from sklearn.model_selection import train_test_split
from pipeline import build_pipeline
import os

# Load and process dataset
dataset_path = os.path.join(os.path.dirname(__file__), "blinkit sales dataset.xlsx")
final_df = build_pipeline(dataset_path)

features = [
    'net_stock', 'total_quantity', 'active_days', 'avg_daily_sales',
    'month', 'dayofweek', 'quarter',
    'avg_sales_per_month', 'category_encoded', 'reorder_threshold'
]
target = 'predicted_days'

X = final_df[features].fillna(0)
y = final_df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = xgb.XGBRegressor(
    n_estimators=1000,
    learning_rate=0.01,
    early_stopping_rounds=50
)
model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=100)

# Save model
joblib.dump(model, "demand_forecast_model.pkl")
print("✅ Model trained and saved as demand_forecast_model.pkl")