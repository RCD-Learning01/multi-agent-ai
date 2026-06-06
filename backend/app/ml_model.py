import onnxruntime as ort
import numpy as np
import os

class HealthONNXModel:
    def __init__(self):
        # Menentukan path ke file ONNX
        model_path = os.path.join(os.path.dirname(__file__), "../models/model.onnx")
        self.is_mock = False
        
        if not os.path.exists(model_path) or os.path.getsize(model_path) == 0:
            print(f"Warning: File ONNX '{model_path}' tidak ditemukan atau kosong (0-byte). Mengaktifkan Mock Model.")
            self.is_mock = True
            return
            
        try:
            # Load sesi ONNX Runtime
            self.session = ort.InferenceSession(model_path)
            self.input_name = self.session.get_inputs()[0].name
            self.output_name = self.session.get_outputs()[0].name
        except Exception as e:
            print(f"Warning: Gagal memuat ONNX model: {e}. Mengaktifkan Mock Model.")
            self.is_mock = True

    def predict(self, feature_vector: list):
        """
        Menerima list fitur (sesuai jumlah kolom input model Anda)
        dan mengembalikan hasil prediksi/skor akurasi model.
        """
        if self.is_mock:
            # Hitung skor kesehatan tiruan yang logis berdasarkan fitur
            # Urutan fitur asumsi:
            # [gdp_per_capita, health_expenditure_pct, clean_water_access_pct, sanitation_access_pct, tb_incidence_per_100k, hiv_prevalence_pct, immunization_rate_pct]
            if len(feature_vector) >= 7:
                gdp, health_pct, water, sanitation, tb, hiv, immun = feature_vector[:7]
                
                # Formula simulasi indeks kualitas kesehatan masyarakat (0.0 sampai 1.0)
                score = (water / 100.0 * 0.25) + (sanitation / 100.0 * 0.25) + (immun / 100.0 * 0.3)
                score += min(health_pct / 15.0, 1.0) * 0.1
                score += min(gdp / 20000.0, 1.0) * 0.1
                score -= min(tb / 1000.0, 1.0) * 0.15
                score -= min(hiv / 5.0, 1.0) * 0.1
                
                final_score = max(0.1, min(1.0, score))
                return [final_score]
            return [0.854] # Default fallback
            
        # Konversi input menjadi numpy array dengan tipe data float32
        input_data = np.array([feature_vector], dtype=np.float32)
        
        # Jalankan inferensi
        outputs = self.session.run([self.output_name], {self.input_name: input_data})
        
        # Mengembalikan hasil prediksi (misal: indeks kelas atau probabilitas)
        return outputs[0].tolist()