import React, { useEffect } from 'react'

function Iframe(props) {
  const { id, url } = props

  useEffect(() => {
    const dom = document.getElementById(id)

    setTimeout(() => {
      if (url) {
        dom.src = url
      }
    }, 200)
  }, [url])

  return <iframe id={id} width="100%" height="100%" frameBorder={0} />
}

export default Iframe
