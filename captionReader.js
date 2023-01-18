class captionReader {
  constructor (file) {
    this.file = file
    this.captionsData = []
    this.fileExt = this.file.name.match(/\..+/)[0]
    this.nameFragment = this.file.name.match(/.+\./)[0]
  }

  readFile () {
    const reader = new FileReader()
    reader.readAsText(this.file)
    var resultsArray = []
    let captionsArray
    //console.log(reader.result)
    reader.addEventListener('load', async function (e) {
      var resultString = e.target.result
      resultString = resultString.replace(/[\r]/g, '')
      if (resultString.search('\n\n')) {
        captionsArray = resultString.split('\n\n')
      } else {
        captionsArray = resultString.split('\r\n\r\n')
      }
      alert(captionsArray.length)
      captionsArray.forEach(element => {
        if (element.split('\n').length >= 3) {
          var object = reconstructObject(element)
          //console.log(object)
          if (object.start && object.end) {
            resultsArray.push(object)
          }
        }
      })
      loadRegionsAsync(resultsArray).then(results => {
        localCaptionsClass.seedRegions(results)
        resetCaptionsDiv()
      })
      this.file = null
      this.captionsData = []
    })
    this.loadFile()
    //window.location.reload()
  }

  async loadFile () {
    localStorage.captionName = this.nameFragment
    localStorage.captionType = this.fileExt
  }
}
