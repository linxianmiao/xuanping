if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    if (event.message === 'ResizeObserver loop completed with undelivered notifications.') {
      document.getElementById('webpack-dev-server-client-overlay').style.display = 'none'
    }
  })
}

export default from './ticketlist.widget'
