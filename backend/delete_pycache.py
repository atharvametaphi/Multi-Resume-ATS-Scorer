import os
import shutil
import time

def delete_pycache_folders():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    for root, dirs, files in os.walk(current_dir):
        if "__pycache__" in dirs:
            pycache_path = os.path.join(root, "__pycache__")
            print(f"Deleting: {pycache_path}")
            shutil.rmtree(pycache_path)

if __name__ == "__main__":
    while True:
        delete_pycache_folders()
        print("All __pycache__ folders deleted.")
        time.sleep(5)  # wait for 5 seconds