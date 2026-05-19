# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.responses import JSONResponse
# pyrefly: ignore [missing-import]
from deepface import DeepFace
import numpy as np
# pyrefly: ignore [missing-import]
import cv2
import json

app = FastAPI(title="Face Recognition Service", version="1.0")

# Preload the model to save time on requests
model_name = "Facenet"

def read_imagefile(file) -> np.ndarray:
    nparr = np.frombuffer(file, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def check_liveness(img: np.ndarray, threshold: float = 100.0):
    # Convert image to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Calculate Laplacian variance (focus measure)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    is_live = bool(variance >= threshold)
    return float(variance), is_live

@app.get("/")
def read_root():
    return {"status": "Face Service is running", "model": model_name}

@app.post("/register")
async def register_face(photo: UploadFile = File(...)):
    try:
        contents = await photo.read()
        img = read_imagefile(contents)

        # Liveness check
        liveness_score, is_live = check_liveness(img)
        if not is_live:
            raise HTTPException(status_code=400, detail=f"Anti-Spoofing: Liveness check failed (score: {liveness_score:.1f} < 100.0). Ensure photo is sharp and not a printout/screen.")

        # Get embeddings
        result = DeepFace.represent(img_path=img, model_name=model_name, enforce_detection=True)
        
        if len(result) == 0:
            raise HTTPException(status_code=400, detail="No face detected in the photo.")
        if len(result) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected. Please ensure only one face is visible.")

        embedding = result[0]["embedding"]
        
        return JSONResponse(content={
            "status": "success",
            "embedding": embedding,
            "liveness_score": liveness_score,
            "is_live": is_live
        })

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify")
async def verify_face(
    photo: UploadFile = File(...),
    stored_embedding: str = Form(...)
):
    try:
        contents = await photo.read()
        img = read_imagefile(contents)
        
        # Liveness check
        liveness_score, is_live = check_liveness(img)

        # Parse stored embedding back to list
        known_embedding = json.loads(stored_embedding)

        # Get embedding of the uploaded photo
        result = DeepFace.represent(img_path=img, model_name=model_name, enforce_detection=True)
        
        if len(result) == 0:
            raise HTTPException(status_code=400, detail="No face detected in the photo.")

        current_embedding = result[0]["embedding"]

        # Calculate cosine distance
        def cosine_metric(x, y):
            a = np.matmul(np.transpose(x), y)
            b = np.sum(np.multiply(x, x))
            c = np.sum(np.multiply(y, y))
            return 1 - (a / (np.sqrt(b) * np.sqrt(c)))

        distance = cosine_metric(np.array(known_embedding), np.array(current_embedding))
        
        threshold = 0.40
        is_match = bool(distance <= threshold)

        return JSONResponse(content={
            "status": "success",
            "is_match": is_match,
            "distance": float(distance),
            "threshold": threshold,
            "liveness_score": liveness_score,
            "is_live": is_live
        })

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
