class captionGlob {
    constructor (data, element) {
      this.element = element
      this.captionsArray = data
      if (this.element.nodeName == 'VIDEO') {
        if (element.textTracks.length === 0) {
          this.trackEl = this.element.addTextTrack('captions', 'English', 'en')
          this.trackEl.mode = 'showing'
        } else {
          this.trackEl = this.element.textTracks[0]
          this.trackEl.mode = 'showing'
        }
      }
      this.trackString = ''
      this.captionGlob
    }
  
    millisecondsToTimeStamp (miliseconds) {
      const total = miliseconds
      const milliseconds = Math.floor(total % 1000)
      const seconds = Math.floor((total / 1000) % 60)
      const minutes = Math.floor((total / 1000 / 60) % 60)
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  
      return {
        total,
        hours,
        minutes,
        seconds,
        milliseconds
      }
    }
  
    createTextTrack () {
      if (this.captionsArray.length > 0) {
        this.captionsArray.forEach(captionObject => {
          var startTime = captionObject.start
          var endTime = captionObject.end
          var captionstring = processCaptionString(captionObject.data.note).cueTex
          var queObject = new VTTCue(startTime, endTime, captionstring)
          queObject.line = 'auto'
          this.trackEl.addCue(queObject)
        })
      }
    }
    createGlob (type = 'vtt') {
      this.trackString = ''
      let secondsSeparator = ','
      switch (type) {
        case 'vtt':
          this.trackString += 'WEBVTT' + '\n\n'
          secondsSeparator = '.'
          break
        case 'srt':
          secondsSeparator = ','
          break
        case 'ttml':
          break
        default:
          this.trackString.includes('WEBVTT')
            ? null
            : (this.trackString += 'WEBVTT' + '\n\n')
          secondsSeparator = '.'
          break
      }
      if (this.captionsArray.length > 0) {
        //console.log(this.captionsArray)
        this.captionsArray.forEach(captionObject => {
          var startObj = this.millisecondsToTimeStamp(captionObject.start * 1000)
          var endObj = this.millisecondsToTimeStamp(captionObject.end * 1000)
          var startTime =
            startObj.hours +
            ':' +
            startObj.minutes +
            ':' +
            startObj.seconds +
            secondsSeparator +
            startObj.milliseconds
          var endTime =
            endObj.hours +
            ':' +
            endObj.minutes +
            ':' +
            endObj.seconds +
            secondsSeparator +
            endObj.milliseconds
          var captionstring = processCaptionString(captionObject.data.note).cueTex
          var captionId = captionObject.data.lineNumber
          this.trackString +=
            captionId +
            '\n' +
            startTime +
            ' --> ' +
            endTime +
            '\n' +
            captionstring +
            '\n\n'
        })
      }
      this.captionGlob = new Blob([this.trackString], { type: 'text/' + type })
      return this.captionGlob
    }
    downloadFile (type = 'vtt') {
      this.createGlob(type)
      var url = URL.createObjectURL(this.captionGlob)
      var link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'caption2.' + type)
      link.click()
      URL.revokeObjectURL(url)
    }
  }