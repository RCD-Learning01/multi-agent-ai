import onnxruntime as ort
import numpy as np
import os

class HealthONNXModel:
    def __init__(self):
        # Menentukan path ke file ONNX
        model_path = os.path.join(os.path.dirname(__file__), "../models/model.onnx")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model ONNX tidak ditemukan di: {model_path}")
        
        # Load sesi ONNX Runtime
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name

    def predict(self, feature_vector: list):
        """
        Menerima list fitur (sesuai jumlah kolom input model Anda)
        dan mengembalikan hasil prediksi/skor akurasi model.
        """
        # Konversi input menjadi numpy array dengan tipe data float32
        input_data = np.array([feature_vector], dtype=np.float32)
        
        # Jalankan inferensi
        outputs = self.session.run([self.output_name], {self.input_name: input_data})
        
        # Mengembalikan hasil prediksi (misal: indeks kelas atau probabilitas)
        return outputs[0].tolist()