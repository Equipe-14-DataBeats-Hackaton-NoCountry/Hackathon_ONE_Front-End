import { useEffect, useState } from 'react';

export function useClients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetch("./clients.json")
      .then((res) => {
        if (!res.ok) throw new Error("Arquivo clients.json não encontrado");
        return res.json();
      })
      .then((data) => {
        console.log("Clientes carregados:", data);
        setClients(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return clients;
}