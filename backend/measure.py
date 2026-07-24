import httpx
import time

def measure():
    start = time.time()
    ttft = None
    count = 0
    client = httpx.Client()
    try:
        with client.stream('POST', 'http://127.0.0.1:8000/api/medgemma', json={'message':'What is machine learning?'}, timeout=120) as r:
            for chunk in r.iter_text():
                if not ttft and chunk.strip():
                    ttft = time.time() - start
                count += 1
        total_time = time.time() - start
        ttft_val = f"{ttft:.2f}s" if ttft else "None"
        print(f"TTFT: {ttft_val}, Total Time: {total_time:.2f}s, Chunks: {count}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    measure()
