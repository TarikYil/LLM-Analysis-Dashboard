def key_insights(df):
    insights = []
    if 'SUBSCRIPTION_COUNTY' in df.columns:
        top_county = df.groupby('SUBSCRIPTION_COUNTY')['NUMBER_OF_SUBSCRIBER'].sum().idxmax()
        insights.append(f"En çok abone {top_county} ilçesinde bağlandı.")
    if 'SUBSCRIPTION_DATE' in df.columns:
        top_date = df.groupby('SUBSCRIPTION_DATE')['NUMBER_OF_SUBSCRIBER'].sum().idxmax()
        insights.append(f"En yoğun tarih {top_date} oldu.")
    return insights
