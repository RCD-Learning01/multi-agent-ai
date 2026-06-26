import onnxruntime as ort
import numpy as np
import os

class HealthONNXModel:
    def __init__(self):
        # Path: Mencari model onnx terbaru
        self.model_path = os.path.join(os.path.dirname(__file__), "lstm_risk_classifier_final.onnx")
        self.is_mock = False
        
        if not os.path.exists(self.model_path):
            print(f"Warning: File ONNX tidak ditemukan di {self.model_path}. Mengaktifkan Mock Model.")
            self.is_mock = True
            return
            
        try:
            self.session = ort.InferenceSession(self.model_path)
            print("Model ONNX berhasil dimuat!")
        except Exception as e:
            print(f"Warning: Gagal memuat ONNX model: {e}. Mengaktifkan Mock Model.")
            self.is_mock = True

    def predict(self, feature_vector: list):
        if self.is_mock:
            # Mock logic (sebagai backup) mengembalikan Risiko Sedang (1)
            return 1, 0.75
            
        try:
            # SCALE INPUTS (Menggunakan parameter MinMaxScaler dari data latih/X_train)
            min_vals = np.array([109.59381361, 1.32651615, 1.28395846, 19.0])
            max_vals = np.array([288001.43336904, 27.08968544, 100.0, 99.0])
            
            raw_data = np.array(feature_vector, dtype=np.float32)
            
            # Terapkan formula MinMaxScaler: (X - X_min) / (X_max - X_min)
            scaled_data = (raw_data - min_vals) / (max_vals - min_vals)
            # Memastikan tidak ada nilai yang bocor di luar 0 dan 1 akibat ekstrim user input
            scaled_data = np.clip(scaled_data, 0.0, 1.0)
            
            # RESHAPE untuk LSTM (PENTING!)
            # Input dari user (1D) diubah jadi (1, 1, 4) karena model mengharapkan 4 fitur
            input_tensor = scaled_data.reshape(1, 1, 4).astype(np.float32)
            
            # Mendapatkan nama input model secara dinamis
            input_name = self.session.get_inputs()[0].name
            
            # Inferensi
            prediction = self.session.run(None, {input_name: input_tensor})
            
            # prediction[0][0] berisi array probabilitas 3 kelas (0, 1, 2)
            probabilities = prediction[0][0]
            # Mengembalikan index dengan probabilitas tertinggi
            predicted_class = int(np.argmax(probabilities))
            max_prob = float(np.max(probabilities))
            return predicted_class, max_prob
            
        except Exception as e:
            print(f"Error saat prediksi ONNX: {e}")
            return 1, 0.5