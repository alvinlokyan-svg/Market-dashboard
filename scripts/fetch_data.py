# scripts/fetch_data.py（先測試版，用 SPY）
import yfinance as yf
import json
from datetime import datetime
import pytz

# 設定香港時間
hk_tz = pytz.timezone('Asia/Hong_Kong')

def fetch_macro():
    tickers = ['ES=F', 'NQ=F', 'CL=F', 'GC=F', 'DX=F', '^VIX']  # 期貨 + VIX
    data = []
    for ticker in tickers:
        stock = yf.Ticker(ticker)
        hist = stock.history(period='1mo')
        if not hist.empty:
            last_price = hist['Close'][-1]
            week_change = ((hist['Close'][-1] - hist['Close'][-5]) / hist['Close'][-5]) * 100 if len(hist) >= 5 else 0
            data.append({
                'Ticker': ticker,
                'Last': round(last_price, 2),
                '1W%': f"{week_change:.1f}%"
            })
    return {'columns': ['Ticker', 'Last', '1W%'], 'rows': data}

def main():
    macro_data = fetch_macro()
    
    # 寫 meta.json
    now_hkt = datetime.now(hk_tz).strftime('%Y-%m-%d %H:%M HKT')
    meta = {'last_updated_hkt': now_hkt}
    
    # 存檔
    with open('../data/macro.json', 'w') as f:
        json.dump(macro_data, f, indent=2)
    with open('../data/meta.json', 'w') as f:
        json.dump(meta, f, indent=2)
    
    print("✅ 測試成功！產出 data/macro.json + meta.json")
    print(f"Last updated: {now_hkt}")

if __name__ == '__main__':
    main()
