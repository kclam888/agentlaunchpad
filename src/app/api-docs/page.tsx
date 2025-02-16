'use client'

import { useEffect } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocsPage() {
  useEffect(() => {
    // Load swagger spec
    fetch('/api/docs')
      .then(res => res.json())
      .then(spec => {
        const ui = SwaggerUI({
          spec,
          dom_id: '#swagger-ui',
        })
      })
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div id="swagger-ui" />
    </div>
  )
} 