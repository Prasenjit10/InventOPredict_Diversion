from pipeline import build_pipeline
import os

dataset_path = "blinkit sales dataset.xlsx"
pipeline_output = build_pipeline(dataset_path)

trends = pipeline_output['regional_trends']
spikes = pipeline_output['spikes']

# 1. Print Top Trending Regions
print("--- Top 5 Regions by Total Sales ---")
top_regions = trends.groupby('area')['quantity'].sum().nlargest(5)
print(top_regions)

# 2. Identify Recent Spikes
print("\n--- Unusual Sales Spikes Detected ---")
# Filtering for the most significant spikes
significant_spikes = spikes.sort_values(by='z_score', ascending=False).head(10)
if significant_spikes.empty:
    print("No unusual spikes detected based on current Z-score threshold.")
else:
    for _, row in significant_spikes.iterrows():
        print(f"Region: {row['area']} | Product ID: {row['product_id']} | "
              f"Date: {row['order_date'].date()} | "
              f"Quantity: {row['quantity']} (Z-Score: {row['z_score']:.2f})")

# 3. Save for Visualization (e.g., PowerBI or Tableau)
trends.to_csv("regional_sales_trends.csv", index=False)
spikes.to_csv("detected_spikes.csv", index=False)