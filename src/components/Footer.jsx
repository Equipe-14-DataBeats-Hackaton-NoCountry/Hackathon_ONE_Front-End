import React from 'react'
import { motion } from 'framer-motion'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      style={{
        marginTop: '60px',
        paddingTop: '30px',
        borderTop: '1px solid #333',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.9rem'
      }}
    >
      <p style={{ margin: 0 }}>
        © {year} — Aplicação feita pela equipe <span style={{ color: '#1DB954', fontWeight: 'bold' }}>DataBeats</span>. Todos os direitos reservados.
      </p>
    </motion.footer>
  )
}
