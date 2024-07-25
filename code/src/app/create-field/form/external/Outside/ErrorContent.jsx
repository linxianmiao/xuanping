import React from 'react'

const ErrorContent = props => {
  const { data } = props
  let content = ''

  try {
    content = JSON.stringify(JSON.parse(data), null, 2)
  } catch (e) {
    content = data && typeof data === 'string' ? data : ''
  }

  return (
    <div className="ajax-wrap" style={{ height: 200, overflowY: 'auto' }}>
      <pre style={{ height: '100%' }}>{content}</pre>
    </div>
  )
}

export default ErrorContent
