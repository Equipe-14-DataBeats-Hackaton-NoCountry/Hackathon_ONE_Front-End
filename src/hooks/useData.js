import { useState, useEffect } from "react";

export function useData() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch("./metrics.json") // Usando ./ para garantir o caminho relativo à raiz pública
      .then((res) => {
        if (!res.ok) throw new Error("Arquivo metrics.json não encontrado");
        return res.json();
      })
      .then((data) => {
        console.log("Métricas carregadas:", data);
        setMetrics(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return { metrics };
}