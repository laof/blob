;(function () {
  if (!window.username || !window.password) {
    console.log('please input username and password')
    return
  }

  console.log(window.username, window.password)
})()
