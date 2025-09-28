import pandas as pd

def compare(df, county1, county2, start_date=None, end_date=None):
    df['SUBSCRIPTION_DATE'] = pd.to_datetime(df['SUBSCRIPTION_DATE'])
    if start_date and end_date:
        mask = (df['SUBSCRIPTION_DATE'] >= start_date) & (df['SUBSCRIPTION_DATE'] <= end_date)
        df = df[mask]
    data1 = df[df['SUBSCRIPTION_COUNTY']==county1]['NUMBER_OF_SUBSCRIBER'].sum()
    data2 = df[df['SUBSCRIPTION_COUNTY']==county2]['NUMBER_OF_SUBSCRIBER'].sum()
    return {county1: int(data1), county2: int(data2)}
