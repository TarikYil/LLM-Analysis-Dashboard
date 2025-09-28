import pandas as pd
from io import BytesIO
import mimetypes

def parse_file(filename: str, file_bytes: bytes):
    content_type, _ = mimetypes.guess_type(filename)
    if content_type in ['text/csv', 'application/vnd.ms-excel'] or filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(file_bytes))
    elif filename.lower().endswith('.xlsx'):
        df = pd.read_excel(BytesIO(file_bytes))
    else:
        df = pd.DataFrame()
    return df
