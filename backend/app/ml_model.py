import onnxruntime as ort
import numpy as np
import os

class HealthONNXModel:
    def __init__(self):
        # Path: Mencari model.onnx di folder yang sama dengan file ml_model.py ini
        self.model_path = os.path.join(os.path.dirname(__file__), "model.onnx")
        self.is_mock = False
        
        if not os.path.exists(self.model_path):
            print(f"Warning: File ONNX tidak ditemukan di {self.model_path}. Mengaktifkan Mock Model.")
            self.is_mock = True
            return
            
        try:
            self.session = ort.InferenceSession(self.model_path)
            print("✅ Model ONNX berhasil dimuat!")
        except Exception as e:
            print(f"Warning: Gagal memuat ONNX model: {e}. Mengaktifkan Mock Model.")
            self.is_mock = True

    def predict(self, feature_vector: list):
        if self.is_mock:
            # Mock logic (sebagai backup)
            return [0.85] 
            
        try:
            # RESHAPE untuk LSTM (PENTING!)
            # Input dari user (1D) diubah jadi (1, 1, N_features) 
            # Sesuaikan N_features dengan jumlah input modelmu (biasanya 7)
            input_data = np.array(feature_vector, dtype=np.float32)
            input_tensor = input_data.reshape(1, 1, -1) 
            
            # Mendapatkan nama input model secara dinamis
            input_name = self.session.get_inputs()[0].name
            
            # Inferensi
            prediction = self.session.run(None, {input_name: input_tensor})
            return prediction[0][0]
        except Exception as e:
            print(f"Error saat prediksi ONNX: {e}")
            return [0.0]