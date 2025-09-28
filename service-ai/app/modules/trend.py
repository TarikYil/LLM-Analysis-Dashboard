def compute_trend(df):
    trend = {}
    if 'SUBSCRIPTION_DATE' in df.columns and 'NUMBER_OF_SUBSCRIBER' in df.columns:
        trend_series = df.groupby('SUBSCRIPTION_DATE')['NUMBER_OF_SUBSCRIBER'].sum()
        trend = {str(k): int(v) for k,v in trend_series.to_dict().items()}
    return trend
