function hideHelp () {
  document.getElementById('helpDiv').style.opacity = 0
  document.getElementById('helpDiv').style.zIndex = 0
  document.body.removeChild(document.getElementById('helpDiv'))
}

function showHelp () {
  document.body.insertBefore(helpDiv, document.getElementById('editorDiv'))
  document.getElementById('helpDiv').style.opacity = 1
  document.getElementById('helpDiv').style.zIndex = 1000
}
function hideSnippets () {
  document.getElementById('snippetsDiv').style.opacity = 0
  document.getElementById('snippetsDiv').style.zIndex = 0
  document.body.removeChild(document.getElementById('snippetsDiv'))
}

function showSnippets () {
  document.body.insertBefore(snippetDiv, document.getElementById('editorDiv'))
  document.getElementById('snippetsDiv').style.opacity = 1
  document.getElementById('snippetsDiv').style.zIndex = 1000
}
//show hotkeys and filter them through a searchbar and a loop
function searchHotkeys () {
  filteredShortcuts = []
  var searchBox = document.getElementById('searchShortcuts')
  var searchString = searchBox.value
  var searchArray = searchString.split(' ')

  if (searchString.length > 0) {
    var found = false
    index = 0
    shortcutData.forEach(element => {
      var question = element.details.toLocaleLowerCase()
      found = false
      searchArray.forEach(param => {
        param = param.toLocaleLowerCase()
        if (param) {
          found = question.includes(param)
        }
      })
      if (found) {
        var elem1 = element

        filteredShortcuts.push(elem1)
      }
      index++
    })
    if (filteredShortcuts != []) {
      //(searchArray.join(' '))
      var targetDiv = document.getElementById('shortcutsLoop')
      targetDiv.setAttribute('x-data', '{data:filteredShortcuts}')
      //console.log(targetDiv)
    } else {
      //('nada')
    }
  } else {
    var targetDiv = document.getElementById('shortcutsLoop')
    targetDiv.setAttribute('x-data', '{data:shortcutData}')
  }
  //('new data ', newData)
}

function searchSnippets () {
  var data = document.getElementById('templateSearch').value
  var dataDiv = document.getElementById('dataDiv')
  dataDiv.setAttribute(
    'x-data',
    '{templates:templates.searchTemplates("' + data + '")}'
  )
  var resDiv = document.getElementById('resultDiv')
  var templatesTableHead = document.getElementById('templatesTableHead')
  if (templates.searchTemplates(data).length == 0 && data.length > 0) {
    resDiv.classList.remove('hidden')
    templatesTableHead.classList.add('hidden')
  } else {
    resDiv.classList.add('hidden')
    templatesTableHead.classList.remove('hidden')
  }
}

function hideShortcutDiv () {
  document.getElementById('hotkeyDiv').style.opacity = 0
  document.getElementById('hotkeyDiv').style.zIndex = 0
  document.body.removeChild(document.getElementById('hotkeyDiv'))
}

function showShortcutDiv () {
  document.body.insertBefore(hotkeyDiv, document.getElementById('editorDiv'))
  document.getElementById('hotkeyDiv').style.opacity = 1
  document.getElementById('hotkeyDiv').style.zIndex = 1000
}

//Listen for events
window.onload = () => {
  createHover('target', 'trigger')
  createHover('settingsTarget', 'settingsTrigger')
  createHover('mediaTarget', 'mediaTrigger')
  createHover('jobTarget', 'jobTrigger')
  createHover('helpTarget', 'helpTrigger')
  createHover('editTarget', 'editTrigger')
  saveMediaFile('saveMediaFile')
  newLine(document.getElementById('newLine'))
  deleteLines(document.getElementById('delete'))
  checkAll(document.getElementById('selectAll'))
  unCheckAll(document.getElementById('unselectAll'))
  copyCaption(document.getElementById('copy'))
  pasteCaption(document.getElementById('paste'))
  cutText(document.getElementById('cut'))
  mergeLines(document.getElementById('merge'))
  addAfter(document.getElementById('insertAfter'))
  addBefore(document.getElementById('insertBefore'))
  uploadCaption(document.getElementById('openSubtitle'))
  saveSubtitleAs(document.getElementById('saveSubtitleAs'))
  saveSubtitle(document.getElementById('saveSubtitle'))
  newSubtitle(document.getElementById('newSubtitle'))
}

var wavesurfer
var loading

// Init & load audio file
document.addEventListener('DOMContentLoaded', function () {
  //var waveformZoom=150;
  var video = document.querySelector('video')
  //console.log('video ', video)

  loading = false

  //document.getElementById('loading').style.visibility="hidden";
  //document.removeChild(loadingElement)

  // Init
  wavesurfer = WaveSurfer.create({
    container: document.querySelector('#waveform'),
    height: 100,
    pixelRatio: 1,
    minPxPerSec: 100,
    scrollParent: true,
    normalize: true,
    splitChannels: false,
    hideScrollbar: true,
    autoCenter: true,
    responsive: true,
    regionsMinLength: 1,
    regionsMaxLength: 7,
    enableDragSelection: true,
    backend: 'MediaElement',
    plugins: [
      WaveSurfer.regions.create(),
      WaveSurfer.minimap.create({
        height: 50,
        waveColor: '#ddd',
        progressColor: '#999'
      }),
      WaveSurfer.timeline.create({
        container: '#wave-timeline'
      }),
      WaveSurfer.cursor.create()
    ]
  })
  var rateEl = document.getElementById('playbackRate')
  rateEl.textContent = parseFloat(wavesurfer.getPlaybackRate()).toFixed(2)
  var raiseRateEl = document.getElementById('raisePlayrate')
  var lowerRateEl = document.getElementById('lowerPlayrate')
  raiseRateEl.onclick = function () {
    raisePlayrate()
    rateEl.textContent = parseFloat(wavesurfer.getPlaybackRate()).toFixed(2)
  }
  lowerRateEl.onclick = function () {
    lowerPlayrate()
    rateEl.textContent = parseFloat(wavesurfer.getPlaybackRate()).toFixed(2)
  }
  var raiseVolEl = document.getElementById('volumeUp')
  var lowerVolEl = document.getElementById('volumeDown')
  var volumeEl = document.getElementById('volumeEl')
  volumeEl.textContent = parseFloat(wavesurfer.getVolume()).toFixed(2) * 100

  raiseVolEl.onclick = function () {
    raiseVolume()
    volumeEl.textContent = parseFloat(wavesurfer.getVolume()).toFixed(2) * 100
  }
  lowerVolEl.onclick = function () {
    lowerVolume()
    volumeEl.textContent = parseFloat(wavesurfer.getVolume()).toFixed(2) * 100
  }

  //var waveformZoom = 150
  var zoomElem = document.getElementById('zoomEl')
  zoomElem.textContent = parseFloat(waveformZoom / 150).toFixed(2)
  var zoomInButton = document.getElementById('zoomIn')
  var zoomOutButton = document.getElementById('zoomOut')

  zoomInButton.onclick = function () {
    zoomWaveformIn()
    document.getElementById('zoomEl').textContent = parseFloat(
      waveformZoom / 150
    ).toFixed(2)
  }
  zoomOutButton.onclick = function () {
    zoomWaveformOut()
    document.getElementById('zoomEl').textContent = parseFloat(
      waveformZoom / 150
    ).toFixed(2)
  }
  //create these functions to enable audio controls

  //wavesurfer.regions.enableDragSelection({drag:false});

  // Load audio from existing media element
  let mediaElt = document.querySelector('video')

  wavesurfer.on('error', function (e) {
    console.warn(e)
  })

  fetch('./video/long_clip.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('HTTP error ' + response.status)
      }
      return response.json()
    })
    .then(peaks => {
      globalPeaks = peaks
      //console.log('loaded peaks! sample_rate: ' + peaks.sample_rate)
      //wavesurfer.destroy()
      // load peaks into wavesurfer.js
      wavesurfer.load(mediaElt, peaks.data)
    })
    .catch(e => {
      console.error('error', e)
    })
  //})

  wavesurfer.on('ready', function () {
    wavesurfer.enableDragSelection({
      color: randomColor(0.25)
    })
    setEditorHeight()

    if (localStorage.regions === undefined) {
      wavesurfer.util
        .fetchFile({
          responseType: 'json',
          url: './video/nasa.json'
        })
        .on('success', function (data) {
          loadRegionsAsync(data)
            .then(data => localCaptionsClass.seedRegions(data))
            .then(console.log('sucess'))
        })
    } else {
      loadRegionsAsync(localCaptionsClass.regionsData).then(regions => {
        localCaptionsClass.seedRegions(regions)
      })
    }
    goToLastEdit()
  })

  //parseData(localStorage.regions)
  //stopParsingData()
  video.addEventListener('loadedmetadata', function () {
    //track = this.addTextTrack("captions", "English", "en");

    if (localStorage.regions) {
      if (video.textTracks[0] && video.textTracks[0].activeCues) return
      var captionCreator = new captionGlob(
        localCaptionsClass.regionsData,
        video
      )
      captionCreator.createTextTrack()
      window.captionCreator = captionCreator
    }
  })

  //constructDom(document.getElementById('captionsArea'))
  wavesurfer.on('region-click', function (region, e) {
    e.stopPropagation()
    e.shiftKey ? region.playLoop() : region.play()
  })
  wavesurfer.on('region-click', function (e) {
    editAnnotation(e)
    //wavesurfer.un('region-click')
  })

  wavesurfer.on('region-created', function (e) {
    //saveRegions()
    wavesurfer.un('region-created')
  })
  wavesurfer.on('region-updated', function (e) {
    saveRegions()
  })
  wavesurfer.on('region-removed', saveRegions)

  wavesurfer.on('region-play', function (region) {
    region.once('out', function () {
      wavesurfer.play(region.start)
      wavesurfer.pause()
    })
  })
  window.wavesurfer.on('region-update-end', function (e) {
    if (
      e.start !== null &&
      document.getElementById('note' + e.data.lineNumber)
    ) {
      console.log('region end: ', e.start)
      var localRegions = localCaptionsClass.regionsData
      var linenumber = parseInt(e.data.lineNumber)
      var captionNumber = parseInt(e.data.lineNumber)
      var localRegions = localCaptionsClass.regionsData
      var currentRegion = localRegions[captionNumber - 1]
      if (e.data.note == undefined) {
        e.data.note = ''
      }
      currentRegion.start = parseFloat(e.start).toFixed(2)
      currentRegion.end = parseFloat(e.end).toFixed(2)
      localStorage.regions = JSON.stringify(localRegions)
      var startEl = document.getElementById('start' + linenumber)
      var endEl = document.getElementById('end' + linenumber)
      if (startEl && endEl) {
        startEl.setAttribute('value', parseFloat(e.start).toFixed(2))
        endEl.setAttribute('value', parseFloat(e.end).toFixed(2))
      }
      var index = captionNumber - 1
      localCaptionsClass.updateRegion(captionNumber, currentRegion)
      var currentCue = video.textTracks[0].cues[index]
      //if (!currentCue)
      currentCue.text = processCaptionString(e.data.note).cueTex
      currentCue.startTime = currentRegion.start
      currentCue.endTime = currentRegion.end
    }
    let regionToSave
    var regionsData = localCaptionsClass.regionsData

    //If regions is not in DOM, add it to local Storage. Alpine JS will finish the rest

    if (
      !localCaptionsClass.search('start:' + e.start) &&
      e.data.lineNumber == undefined
    ) {
      regionToSave = {
        start: e.start,
        end: e.end,
        attributes: e.attributes,
        data: {
          note: '',
          lineNumber: null
        },
        regionId: e.id
      }
      console.log('e.start -> ', e.start)
      var sibling = localCaptionsClass.regionSibling(regionToSave)
      var line = sibling
        ? sibling.data.lineNumber
        : Number(regionsData.length + 1)
      regionToSave.data.lineNumber = line + 1
      regionToSave.color = randomColor(0.25)
      var added = wavesurfer.addRegion(regionToSave)
      regionToSave.regionId = added.id
      localCaptionsClass.insertRegion(line + 1, regionToSave)
      createCaptionCue(line, regionToSave)
      setTimeout(() => {
        document.getElementById('note' + (line + 1)).focus()
      }, 50)
    }

    wavesurfer.un('region-update-end', function () {
      console.log('released')
    })
  })

  let playButton = document.querySelector('#play')
  let pauseButton = document.querySelector('#pause')
  wavesurfer.on('play', function () {
    playButton.style.display = 'none'
    pauseButton.style.display = 'block'
  })
  wavesurfer.on('pause', function () {
    playButton.style.display = 'block'
    pauseButton.style.display = 'none'
  })
  var templatesFormToggle = document.getElementById('templatesFormToggle')
  var templatesForm = document.forms[0]
})

function createCaption (captionIndex = false) {
  let regionToAdd
  const regionsData = localCaptionsClass.regionsData
  if (regionsData.length >= 1) {
    const currentNumber = regionsData.length
    let prevCaption = regionsData[currentNumber - 1]
    prevCaption.data.lineNumber = parseInt(prevCaption.data.lineNumber) + 1
    let captionregionStart = parseFloat(prevCaption.end) + 0.01
    if (parseFloat(captionregionStart) + 1.0 > wavesurfer.getDuration()) {
      var captionRegionVal = wavesurfer.getDuration()
    }
    {
      var captionRegionVal = captionregionStart + 1
    }
    regionToAdd = {
      start: captionregionStart.toFixed(2),
      end: captionRegionVal.toFixed(2),
      data: {
        lineNumber: currentNumber,
        note: ''
      }
    }
  } else {
    regionToAdd = {
      start: 0.0,
      end: 2.0,
      data: {
        lineNumber: 1,
        note: ''
      }
    }
  }

  regionToAdd.color = randomColor(0.25)
  var added = wavesurfer.addRegion(regionToAdd)
  regionToAdd.regionId = added.id
  localCaptionsClass.addRegions(regionToAdd)
  line = localCaptionsClass.regionsData.length
  var video = document.querySelector('video')
  var textTrack = video.textTracks[0]
  var startTime = regionToAdd.start
  var endTime = regionToAdd.end
  var captionstring = processCaptionString(regionToAdd.data.note).cueTex
  var queObject = new VTTCue(startTime, endTime, captionstring)
  queObject.line = 'auto'
  textTrack.addCue(queObject)
  resetCaptionsDiv()
  setTimeout(() => {
    document.getElementById('note' + regionToAdd.data.lineNumber).focus()
  }, 50)
}

function wavesurferRegion (id) {
  var localRegion = localCaptionsClass.regionsData[id]
  var regionId = localRegion.regionId
  return wavesurfer.regions.list[regionId]
}

function saveRegions () {
  var count = 1
  localStorage.regions = JSON.stringify(
    Object.keys(wavesurfer.regions.list).map(function (id) {
      let region = wavesurfer.regions.list[id]
      let regionData = count
      var linenumber = region.data.lineNumber
      if (linenumber == undefined) {
        regionData = {
          note: '',
          lineNumber: count
        }
      } else {
        regionData = region.data
      }
      var regionToAdd = {
        start: region.start,
        end: region.end,
        attributes: region.attributes,
        data: regionData,
        regionId: region.id
      }
      //alert(regionToAdd)
      count++
      return regionToAdd
    })
  )
}

/**
 * Load regions from localStorage.
 */
function loadRegions (regions) {
  flashMessage('loading regions...', 'editorInfo')
  var result = []
  regions.forEach(function (region) {
    region.color = randomColor(0.25)
    var added = wavesurfer.addRegion(region)
    region.regionId = added.id
    result.push(region)
  })
  flashMessage('loaded succesfully', 'editorInfo')
  return result
}

/**
 * Extract regions separated by silence.
 */
function extractRegions (peaks, duration) {
  // Silence params
  let minValue = 0.0015
  let minSeconds = 0.25

  let length = peaks.length
  let coef = duration / length
  let minLen = minSeconds / coef

  // Gather silence indeces
  let silences = []
  Array.prototype.forEach.call(peaks, function (val, index) {
    if (Math.abs(val) <= minValue) {
      silences.push(index)
      //console.log(val)
    }
  })
  // Cluster silence values
  let clusters = []
  silences.forEach(function (val, index) {
    if (clusters.length && val == silences[index - 1] + 1) {
      clusters[clusters.length - 1].push(val)
    } else {
      clusters.push([val])
    }
  })

  // Filter silence clusters by minimum length
  let fClusters = clusters.filter(function (cluster) {
    return cluster.length >= minLen
  })

  // Create regions on the edges of silences
  let regions = fClusters.map(function (cluster, index) {
    let next = fClusters[index + 1]
    return {
      start: cluster[cluster.length - 1],
      end: next ? next[0] : length - 1
    }
  })

  // Add an initial region if the audio doesn't start with silence
  let firstCluster = fClusters[0]
  if (firstCluster && firstCluster[0] != 0) {
    regions.unshift({
      start: 0,
      end: firstCluster[firstCluster.length - 1]
    })
  }

  // Filter regions by minimum length
  let fRegions = regions.filter(function (reg) {
    return reg.end - reg.start >= minLen
  })

  // Return time-based regions
  return fRegions.map(function (reg) {
    return {
      start: Math.round(reg.start * coef * 100) / 100,
      end: Math.round(reg.end * coef * 100) / 100
    }
  })
}

/**
 * Random RGBA color.
 */
function randomColor (alpha) {
  return (
    'rgba(' +
    [
      ~~(Math.random() * 255),
      ~~(Math.random() * 255),
      ~~(Math.random() * 255),
      alpha || 1
    ] +
    ')'
  )
}

/**
 * Edit annotation for a region.
 */

var waveformZoom = 150
//console.log(waveformZoom)

//shortcuts code
window.addEventListener(
  'keydown',
  function (e) {
    var waveform = document.getElementById('waveform')
    var captionNumber = e.target.parentElement.id
    //console.log('parent: ', e.target.parentElement)
    var startEl = document.getElementById('start' + captionNumber)
    var endEl = document.getElementById('end' + captionNumber)

    if (
      e.target.nodeName == 'INPUT' &&
      e.target.name != 'search' &&
      (e.target.name != 'snippetSearch') & (e.target.id != 'templateSearch') &&
      e.target.name != 'templateHotkeys' &&
      e.target.name != 'templateValue'
    ) {
      const captionName = e.target.name
      var captionNumber = parseInt(captionName.match(/\d/gi).join(''))
      var elemName = captionName.match(/\D/gi).join('')
      if (
        (e.keyIdentifier == 'U+000A' ||
          e.keyIdentifier == 'Enter' ||
          e.keyCode === 13) &&
        e.altKey
      ) {
        insertBreak(e.target)
      }

      if (e.keyCode == 219) {
        insertInto(']', e.target)
      }

      if (
        (e.keyIdentifier == 'U+000A' ||
          e.keyIdentifier == 'Enter' ||
          e.keyCode === 13) &&
        e.shiftKey
      ) {
        if (e.target.nodeName == 'INPUT' && e.target.type == 'text') {
          e.preventDefault()
          var localRegions = localCaptionsClass.regionsData
          // console.log('caption created by this event', e)
          if (localRegions.length == 0) {
            var seedRegion = {
              start: 0.0,
              end: 2.0,
              data: {
                note: '',
                lineNumber: 1
              }
            }
            loadRegionsAsync([seedRegion]).then(result =>
              localCaptionsClass.seedRegions(result)
            )
          }

          //console.log(wavesurfer.getDuration() === wavesurfer.getCurrentTime())
          if (
            localRegions[localRegions.length - 1].end >=
            wavesurfer.getDuration()
          ) {
            alert('Maximum number of captions reached!')
          } else {
            const createdCaption = document.getElementById(
              'note' + localRegions.length
            )
            createCaption()
            createdCaption ? createdCaption.focus() : null
          }
          //updateCurrentRegion(e);
        } else {
        }
      }

      //console.log(e.keyCode)

      if (e.ctrlKey && e.keyCode == 77) {
        e.preventDefault()
        mergeSelectedCaptions()
      }

      if (e.altKey && e.key == 'v') {
        e.preventDefault()
        //console.log(e.key, 'volume down')
        lowerVolume()
        volumeEl.textContent = parseInt(wavesurfer.getVolume().toFixed(2) * 100)
      }
      if (e.altKey && e.key == 'b') {
        e.preventDefault()
        //console.log(e.key, 'volume up')
        raiseVolume()
        volumeEl.textContent = parseInt(wavesurfer.getVolume().toFixed(2) * 100)
      }
      var rateEl = document.getElementById('playbackRate')
      if (e.altKey && e.key == 's') {
        e.preventDefault()
        raisePlayrate()
        rateEl.textContent = parseFloat(wavesurfer.getPlaybackRate()).toFixed(2)
      }

      if (e.altKey && e.key == 'd') {
        e.preventDefault()
        lowerPlayrate()
        rateEl.textContent = parseFloat(wavesurfer.getPlaybackRate()).toFixed(2)
      }
      if (e.altKey && e.key == 'z') {
        zoomWaveformOut()
        //zoomElem.textContent = parseFloat(waveformZoom / 150).toFixed(2)
      }
      if (e.altKey && e.key == 'x') {
        zoomWaveformIn()
        //zoomElem.textContent = parseFloat(waveformZoom / 150).toFixed(2)
      }

      if (e.keyCode === 39 && elemName == 'start') {
        //waveform.scrollLeft = 0
        e.preventDefault()
        addTo('start', parseFloat(startEl.value), captionNumber)
        updateCurrentRegion(e)
      }
      if (e.keyCode === 37 && elemName == 'start') {
        //waveform.scroll(0, 0, 0, 0)
        e.preventDefault()
        subtractFrom('start', parseFloat(startEl.value), captionNumber)
        updateCurrentRegion(e)
      }

      if (e.keyCode === 39 && elemName == 'end') {
        e.preventDefault()
        addTo('end', parseFloat(endEl.value), captionNumber)
        updateCurrentRegion(e)
      }

      if (e.keyCode === 37 && elemName == 'end') {
        e.preventDefault()
        subtractFrom('end', parseFloat(endEl.value), captionNumber)
        updateCurrentRegion(e)
      }
      if (e.keyCode === 38 && e.target.nodeName == 'INPUT') {
        if (captionNumber - 1 != 0) {
          var prevNote = document.getElementById(elemName + (captionNumber - 1))
          prevNote.focus()
        }
      }
      if (e.keyCode === 40 && e.target.nodeName == 'INPUT') {
        if (document.getElementById(elemName + (captionNumber + 1))) {
          var nextNote = document.getElementById(elemName + (captionNumber + 1))
          nextNote.focus()
        }
      }

      if (e.keyCode === 46 && e.target.nodeName === 'INPUT') {
        e.preventDefault()
        var divToRemove = e.target.parentElement
        var divId = parseInt(divToRemove.id)
        var storedRegions = localCaptionsClass.regionsData
        if (storedRegions.length >= 0) {
          if (storedRegions[divId - 1]) {
            var myRegion = storedRegions[divId - 1]
          }
          var regionId = myRegion.regionId
          var cRegion = wavesurfer.regions.list[regionId]
          cRegion.remove()
          index = divId - 1
          localCaptionsClass.deleteRegions(index)
          removeCaptionCue(index)
          localStorage.setItem('captionNumber', storedRegions.length)
          var captionsArea = document.getElementById('captionsPlayground')
          if (
            captionsArea.firstElementChild !== divToRemove &&
            captionsArea.lastElementChild !== divToRemove //&& divToRemove.nextSibling != null
          ) {
            var nextNote = document.getElementById(elemName + captionNumber)
          }
          if (
            captionsArea.lastElementChild === divToRemove &&
            captionsArea.firstElementChild !== divToRemove
          ) {
            //var divId=Number(captionsArea.lastChild.id)
            var nextNote = document.getElementById(
              elemName + (captionNumber - 1)
            )
          }
          resetCaptionsDiv()
          this.setTimeout(() => {
            nextNote.focus()
          }, 200)
        } else {
          alert('You cannot delete that caption')
        }
      }
      if (
        e.target.nodeName === 'INPUT' &&
        shortcutKeys.indexOf(e.keyCode) == -1
      ) {
        //var regionId=parentDiv.id
      }
      //var closures = {40:')',91:']', 123:'}'};
    }
    //wavesurfer.clearRegions()
    //    window.location.reload()
  },
  true
)

let ws = window.wavesurfer

var GLOBAL_ACTIONS = {
  // eslint-disable-line
  play: function () {
    window.wavesurfer.playPause()
  },

  back: function () {
    window.wavesurfer.skipBackward()
  },

  forth: function () {
    window.wavesurfer.skipForward()
  },

  'toggle-mute': function () {
    window.wavesurfer.toggleMute()
  },
  showHelp: function () {
    showHelp()
  },
  showHotkeys: function () {
    showShortcutDiv()
  },
  showSnippets: function () {
    showSnippets()
  }
}

// Bind actions to buttons and keypresses
document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('keydown', function (e) {
    if (e.shiftKey) {
      let map = {
        32: 'play', // space
        37: 'back', // left
        39: 'forth' // right
      }

      let action = map[e.keyCode]
      if (action in GLOBAL_ACTIONS) {
        if (
          document == e.target ||
          document.body == e.target ||
          e.target.attributes['data-action']
        ) {
          e.preventDefault()
        }
        GLOBAL_ACTIONS[action](e)
      }
    }
  })
  ;[].forEach.call(document.querySelectorAll('[data-action]'), function (el) {
    el.addEventListener('click', function (e) {
      let action = e.currentTarget.dataset.action
      if (action in GLOBAL_ACTIONS) {
        e.preventDefault()
        GLOBAL_ACTIONS[action](e)
      } else {
        //
      }
    })
  })
})

//console.log();
var forbidenKeys = ['Enter', 'Delete', 'Control', 'ArrowDown', 'ArrowUp']
window.addEventListener(
  'keyup',
  function (e) {
    if (e.target.name == 'search') {
      searchHelp()
    }
    if (e.target.name == 'searchShortcuts') {
      searchHotkeys()
    }

    if (e.target.nodeName == 'INPUT' && e.target.name == 'snippetSearch') {
      searchSnippets()
    }

    if (
      e.target.nodeName == 'INPUT' &&
      forbidenKeys.indexOf(e.key) == -1 &&
      e.key != 'v' &&
      (e.key != ',' || e.key != '.') &&
      e.target.name != 'search' &&
      e.target.id != 'templateSearch' &&
      e.target.name != 'templateHotkeys' &&
      e.target.name != 'templateValue'
    ) {
      var snipEvent = snippetListener(e)
      if (snipEvent.returnTemplate) {
        var lastSnip = snipEvent.returnTemplate
        var insertedAt = snipEvent.insertPos
        //inserted inside a string
        var formedString = lastSnip.returnTemplate.hotkeys + lastSnip.template
        //inserted at the beggining of the string
        var formedString1 =
          lastSnip.returnTemplate.hotkeys + ' ' + lastSnip.template
        e.target.value =
          e.target.value.replace(formedString, lastSnip.template) ||
          e.target.value.replace(formedString1, lastSnip.template)
        e.target.selectionStart = snipEvent.selectStart
        e.target.selectionEnd = snipEvent.selectStart
      }
      var captionNumber = e.target.parentElement.id
      var localParentDiv = e.target.parentElement
      var regionsArray = localCaptionsClass.regionsData
      //console.log('e.which ', e.which)
      //var localRegion = regionsArray[parseInt(localParentDiv.id) - 1]
      //console.log('local region: ', localRegion)
      if (regionsArray[parseInt(localParentDiv.id) - 1]) {
        //        var regId = localRegion.regionId
        var localRegion = regionsArray[parseInt(localParentDiv.id) - 1]
        var regId = localRegion.regionId
      } else if (!regionsArray) {
        var localRegion = localCaptionsClass.regionsData[0]
        regId = localRegion.regionId
      } else {
        var localRegion = regionsArray[regionsArray.length - 1]
        var regId = localRegion.regionId
      }

      var wavesurferRegion = window.wavesurfer.regions.list[regId]
      var column = e.target.parentElement.children
      var lineNumberVal = column[0].value
      var startVal = column[1].value
      var endVal = column[2].value
      var noteVal = column[3].value
      validateCaption(noteVal, startVal, endVal)
      regionUpdate = {
        start: startVal,
        end: endVal,
        data: {
          note: noteVal,
          lineNumber: lineNumberVal
        },
        regionId: regId
      }
      localStorage.regions = localStorage.regions.replace(
        JSON.stringify(localRegion),
        JSON.stringify(regionUpdate)
      )
      var video = document.querySelector('video')
      var cueIndex = lineNumberVal - 1
      //console.log(video.textTracks)
      if (video.textTracks.length != 0) {
        var currentCue = video.textTracks[0].cues[lineNumberVal - 1]
        //console.log(currentCue)

        if (currentCue != undefined) {
          currentCue.text = processCaptionString(noteVal).cueTex
          currentCue.startTime = startVal
          currentCue.endTime = endVal
        }

        //console.log(currentCue)
      } else {
        //console.log(createCaptionCue(cueIndex, regionToUpdate))
      }

      wavesurferRegion.update({
        start: startVal,
        end: endVal
      })
      wavesurferRegion.data.note = noteVal

      localCaptionsClass.updateRegion(captionNumber, regionUpdate)
      saveLastEdit(e)
      setTimeout(() => {
        wavesurferRegion.play()
      }, 100)
    }
    if (e.code == 'Escape' && e.target.nodeName == 'INPUT') {
      //console.log(e.target.parentElement.id)
      var myRegions = localCaptionsClass.regionsData
      var regId = myRegions[parseInt(e.target.parentElement.id) - 1].regionId
      var mregion = wavesurfer.regions.list[regId]
      mregion.play()
    }
  },
  true
)

window.addEventListener(
  'click',
  function (e) {
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'merge') {
      e.preventDefault()
      mergeCaptions()
      resetCaptionsDiv()
    }
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'addTemplate') {
      e.preventDefault()
      var hotkeydata = getHotKeys()
      var templatedata = getTextSnippet()
      var template = {
        hotkeys: hotkeydata,
        template: templatedata
      }
      //console.log(hotkeydata)
      if (hotkeydata) {
        templates.addTemplate(template)
        var dataDiv = document.getElementById('dataDiv')
        dataDiv.setAttribute('x-data', '{templates:templates.templatesData()}')
        document.forms['templateForm'].reset()
        hideTemplateForm()
      }
    }
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'selectAll') {
      e.target.style.opacity = 1
      var checkBoxes = document.forms[0].querySelectorAll(
        'input[type="checkbox"]'
      )
      checkBoxes.forEach(checkbox => {
        checkbox.checked = true
      })
      //e.target.name='unselect';
      e.target.style.opacity = 0.5
      document.querySelector('button[name="unselect"]').style.opacity = 1
    }
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'hideHelp') {
      hideHelp()
    }
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'hideHotkeyDiv') {
      hideShortcutDiv()
    }
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'showHelp') {
      showHelp()
    }

    if (e.target.nodeName == 'BUTTON' && e.target.name == 'unselect') {
      e.target.style.opacity = 1
      var checkBoxes = document.forms[0].querySelectorAll(
        'input[type="checkbox"]'
      )
      checkBoxes.forEach(checkbox => {
        checkbox.checked = false
      })
      e.target.style.opacity = 0.5
      document.querySelector('button[name="selectAll"]').style.opacity = 1
      //e.target.name='SelectAll';
    }

    if (e.target.nodeName == 'BUTTON' && e.target.name == 'insertBefore') {
      var id = document.getSelection().anchorNode.id
      insertCaption(id, 'before')
    }
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'InsertAfter') {
      var id = document.getSelection().anchorNode.id
      insertCaption(id, 'after')
    }

    if (e.target.nodeName == 'BUTTON' && e.target.name == 'delete') {
      doDelete(e)
      resetCaptionsDiv()
      e.stopPropagation()
    }
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'copy') {
      doCopy()
      e.stopPropagation()
    }
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'paste') {
      doPaste()
      e.stopPropagation()
    }
    if (e.target.nodeName == 'BUTTON' && e.target.name == 'cut') {
      doCutText(getLastElementId())
      e.stopPropagation()
    }
  },
  true
)

localStorage.setItem('captionNumber', 2)
var captionInputs = document.getElementsByClassName('enternew')

if (document.addEventListener) {
  document.addEventListener(
    'contextmenu',
    function (e) {
      var contextMenuElement = document.getElementById('menu')
      e.preventDefault()
      // console.log(e)
      var posX = e.clientX
      var posY = e.clientY
      menu(posX, posY, contextMenuElement)
      //e.preventDefault();
    },
    false
  )
  document.addEventListener(
    'click',
    function (e) {
      var contextMenuElement = document.getElementById('menu')
      contextMenuElement.style.pacity = '0'
      setTimeout(function () {
        contextMenuElement.style.visibility = 'hidden'
      }, 501)
    },
    false
  )
} else {
  document.attachEvent('oncontextmenu', function (e) {
    var posX = e.clientX
    var posY = e.clientY
    menu(posX, posY)
    e.preventDefault()
  })
  document.attachEvent('onclick', function (e) {
    var contextMenuElement = document.getElementById('menu')
    contextMenuElement.style.opacity = '0'
    setTimeout(function () {
      contextMenuElement.style.visibility = 'hidden'
    }, 501)
  })
}

//shortcuts

window.addEventListener(
  'focus',
  function (e) {
    if (
      e.target.nodeName == 'INPUT' &&
      e.target.type == 'text' &&
      e.keyCode != 46 &&
      e.target.name != 'snippetSearch'
    ) {
      saveLastEdit(e)
      const captionName = e.target.name
      var captionNumber =
        parseInt(captionName.match(/\d/gi).join('')) ||
        e.target.parentElement.id
      e.target.autocomplete = 'off'
      var columnId = captionNumber
      var storedRegions = localCaptionsClass.regionsData
      if (storedRegions[columnId - 1]) {
        var regId = storedRegions[columnId - 1].regionId
      } else {
        var regId = storedRegions[storedRegions.length - 1].regionId
      }
      var currentRegion = wavesurfer.regions.list[regId]
      currentRegion !== undefined && playTyping() ? currentRegion.play() : true
      var parentDiv = e.target.parentNode
      var columnChildren = parentDiv.children
      for (let index = 0; index < columnChildren.length; index++) {
        const element = columnChildren[index]
        element.style.backgroundColor = currentRegion.color
        //console.log(element.value)
      }
      wavesurfer.un('region-clicked')
    }
  },
  true
)
window.addEventListener(
  'blur',
  function (e) {
    if (e.target.nodeName == 'INPUT' && e.target.type == 'text') {
      //
      var parentDiv = e.target.parentNode
      //parentNode.childNodes
      var columnChildren = parentDiv.children
      /*
              columnChildren.forEach(element => {
                element.style.backgroundColor ="yellow";
              });
              */
      for (let index = 0; index < columnChildren.length; index++) {
        const element = columnChildren[index]
        element.style.backgroundColor = ''
      }
    }
  },
  true
)

var helpData = [
  {
    question: 'how do I create a new Caption',
    answer:
      'click into any input box i.e captio, start, or end and then hit Shift + Enter'
  },
  {
    question: 'how do I delete a caption',
    answer: 'click on the caption and press Delete key'
  },
  {
    question: 'how do I delete multiple captions',
    answer:
      '1. select the captions by checking their respective checkboxes<br/>2.Right Click and select delete'
  },
  {
    question: 'how do I delete multiple captions',
    answer:
      '1. select the captions by checking their respective checkboxes<br/>2.Right Click and select delete'
  },
  {
    question: 'how do I delete multiple captions',
    answer:
      '1. select the captions by checking their respective checkboxes<br/>2.Right Click and select delete'
  }
]

var shortcutData = [
  {
    combination: 'Alt + V',
    details: 'Lower volume'
  },
  {
    combination: 'Alt + B',
    details: 'Increase volume'
  },
  {
    combination: 'Alt + Z',
    details: 'Zoom out the waveform (GLOBAL)'
  },
  {
    combination: 'Alt + X',
    details: 'Zoom in the waveform (GLOBAL)'
  },
  {
    combination: 'Alt + R',
    details: 'increase playback speed'
  },
  {
    combination: 'Alt + T',
    details: 'Lower playback speed'
  },
  {
    combination: 'Shift + Enter',
    details: 'add new caption after last caption'
  },
  {
    combination: 'Ctrl + Z',
    details: 'Undo'
  },
  {
    combination: 'Ctrl + Y',
    details: 'Redo'
  },
  {
    combination: 'Alt + M',
    details: 'insert a music (&sung;) element'
  }
]

var newData = []
var helpDiv = document.createElement('div')
helpDiv.id = 'helpDiv'
helpDiv.classList =
  'absolute top-0 left-0 w-full h-full flex items-center bg-gray-900 bg-opacity-60'
helpDiv.innerHTML =
  '<div class="w-3/5 mx-auto rounded-md border mb-6 p-2 space-y-2 bg-white space-y-4" x-data="{data:helpData}" id="loopDiv"><div class="mt-0 w-full"><h2 class="text-gray-900 text-xl py-3 px-2 border-b-2 bor grid grid-cols-3 rounded-sm" style="background-color: rgb(89, 95, 172);"><div class="col-span-1 tracking-tighter text-md text-white text-center">Help</div><div class="col-span-1 flex"><input type="text" id="search" name="search" class="text-sm p-1 rounded-l border outline-none text-gray-900" placeholder="/search"><div class="bg-indigo-100 p-1 rounded-r"><span class="fas fa-search mx-1 text-indigo-600 px-1"></span></div></div><div class="col-span-1 text-center"><span class="float-right fas fa-question-circle text-white text-2xl border-0 border-solid rounded-full shadow-lg"></span></div></h2></div><div class="h-72 overflow-y-auto space-y-6 pb-3" id="templateWrapper"><template x-for="dataItem in data" :keys="data.keys"><div class="mx-2 border border-indigo-200 rounded"><p class="text-md questionBg px-2 py-3 rounded-t" x-html="dataItem.question+\'?\'"></p><p class="text-sm answerBg px-2 py-3 rounded-b" x-html="dataItem.answer"></p></div></template></div><button class="w-1/8 text-center text-sm bg-white focus:bg-indigo-600 hover:bg-indigo-600 text-indigo-600 focus:text-white hover:text-white border-indigo-600 border rounded-sm p-1 px-5 ml-2" name="hideHelp">close</button></div>'
var hotkeyDiv = document.createElement('div')
hotkeyDiv.id = 'hotkeyDiv'
hotkeyDiv.classList =
  'absolute top-0 left-0 w-full h-full flex items-center bg-gray-900 bg-opacity-60'
hotkeyDiv.innerHTML =
  '<div class="w-3/5 mx-auto rounded-md border mb-6 p-2 space-y-2 bg-white space-y-4" x-data="{data:shortcutData}" id="shortcutsLoop"><div class="mt-0 w-full"><h2 class="text-gray-900 text-xl py-3 px-2 border-b-2 bor grid grid-cols-3 rounded-sm" style="background-color: rgb(89, 95, 172);"><div class="col-span-1 tracking-tighter text-md text-white text-center">Hotkeys</div><div class="col-span-1 flex"><input type="text" id="searchShortcuts" name="searchShortcuts" class="text-sm p-1 rounded-l border outline-none text-gray-900" placeholder="/search"><div class="bg-indigo-100 p-1 rounded-r"><span class="fas fa-search mx-1 text-indigo-600 px-1"></span></div></div><div class="col-span-1 text-center"><span class="float-right fas fa-keyboard text-white text-4xl border-0 border-solid shadow-lg"></span></div></h2></div><div style="" class="h-72 overflow-y-auto space-y pb-3" id="templateWrapper"><div class="mx-2 border border-indigo-200 rounded-t grid grid-cols-5 divide-x-2" style="margin-bottom: 2px;"><p class="text-md text-indigo-700 px-2 py-3 col-span-1" >Shortcut</p><p class="text-md text-indigo-700 text-opacity-90 font-semibold px-2 py-3 col-span-4" >Details</p></div><template x-for="dataItem in data" :keys="data.keys"><div class="mx-2 border border-indigo-200 grid grid-cols-5" style="margin-bottom: 1px;"><p class="questionBg px-2 py-3 col-span-1" x-html="processShortcutData(dataItem.combination)"></p><p class="text-sm answerBg px-2 py-3 col-span-4" x-html="dataItem.details"></p></div></template></div><button class="w-1/8 text-center text-sm bg-white focus:bg-indigo-600 hover:bg-indigo-600 text-indigo-600 focus:text-white hover:text-white border-indigo-600 border rounded-sm p-1 px-5 ml-2" name="hideHotkeyDiv">close</button></div>'

//Blob.prototype.stream()
//var fileForCaption=new captionFile(glob1)

function captionConfig () {
  this.cueString = {
    color: 'white',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 'smaller'
  }

  this.laughAtmospheric = {
    color: 'white',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 'smaller'
  }

  this.laughterAtmospheric = {
    color: 'white',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 'smaller'
  }

  this.soundAtmospherics = {
    color: 'white',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 'smaller'
  }

  this.actionDescription = {
    color: 'white',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 'smaller'
  }
  ;(this.setConfig = setConfig),
    (this.saveConfig = saveConfig),
    console.info(JSON.parse(localStorage.captionConfig))
  if (!localStorage.captionConfig) {
    localStorage.captionConfig = JSON.stringify(this)
    //'no regions')
  } else {
  }
}

function setConfig (key, objdata) {
  if (!localStorage.captionConfig) {
    var obj = this
  } else {
    var obj = JSON.parse(localStorage.captionConfig)
  }
  const keyVal = key.toCamelCase()
  obj[keyVal] = {
    color: objdata.color,
    fontStyle: objdata.fontStyle,
    fontWeight: objdata.fontWeight,
    fontSize: objdata.fontSize
  }
  saveConfig(obj)
}

function saveConfig (obj) {
  localStorage.captionConfig = JSON.stringify(obj)
}

var templates = new templatesUi()
//console.log(templates.searchTemplates())

function showTemplateForm () {
  document.forms['templateForm'].classList.remove('hidden')
  document.getElementById('templateHotkeys').focus()
  document
    .getElementById('templatesFormToggle')
    .setAttribute('onclick', 'hideTemplateForm()')
  document.getElementById('templatesFormToggle').innerHTML =
    '<span class="fas fa-compress"></span>'
}
function hideTemplateForm () {
  document.forms['templateForm'].classList.add('hidden')
  document
    .getElementById('templatesFormToggle')
    .setAttribute('onclick', 'showTemplateForm()')
  document.getElementById('templatesFormToggle').innerHTML = '&plus;'
}
function getHotKeys () {
  var hotkeyEl = document.getElementById('templateHotkeys')
  return hotkeyEl.value
}
function getTextSnippet () {
  var snippetEl = document.getElementById('templateValue')
  return snippetEl.value
}

function deleteTemplate (object) {
  var templatesArray = templates.templatesData()
  index = templates.templateIndex(object)
  //console.log('index', index)
  if (typeof index == 'number') {
    templates.removeTemplate(index)
    //console.log(index)
  }
  var dataDiv = document.getElementById('dataDiv')
  dataDiv.setAttribute('x-data', '{templates:templates.templatesData()}')
}

var snippetDiv = document.createElement('div')
snippetDiv.id = 'snippetsDiv'
snippetDiv.classList =
  'absolute top-0 left-0 w-full h-full flex items-center bg-gray-900 bg-opacity-60'
snippetDiv.innerHTML =
  '<div class="w-full lg:w-3/5 mx-auto relative border p-2 rounded bg-white space-y-4"><div style="padding: 4px" class="bg-white shadow grid grid-cols-12 gap-x-6"><fieldset class="col-span-8 lg:col-span-10 flex rounded"><input type="text" id="templateSearch" placeholder="search/" class="p-2 rounded-l border text-gray-900 w-full outline-none" name="snippetSearch"/><button class="px-4 bg-indigo-500 text-indigo-100 rounded-r cursor-not-allowed" title="Don\'t click. search happens automatically"><span class="fas fa-search"></span></button></fieldset><button name="addTemplate" class="col-span-4 lg:col-span-2 bg-indigo-800 text-indigo-100 py-1 text-center outline-none rounded" onclick="showTemplateForm()" id="templatesFormToggle">&plus;</button></div><div class="h-72 overflow-auto mt-2" x-data="{templates:templates.templatesData()}" id="dataDiv"><div id="resultDiv" class="bg-red-100 border border-red-200 rounded my-2 py-3 text-center hidden">Oops! Try something else.</div><div class="relative w-full px-3 py-4 bg-gray-100"><form name="templateForm" id="snippetsForm" style="z-index: 1100" class="my-4 p-4 border border-indigo-200 bg-white rounded space-y-4 hidden"><input type="text" name="templateHotkeys" id="templateHotkeys" placeholder="pressHotkeys eg. Alt + X type one by one" class="p-2 outline-none w-full border rounded" onclick="getHotKeys()"/><input type="text" name="templateValue" id="templateValue" placeholder="enter the text snippet here" class="p-2 outline-none w-full border rounded"/><fieldset class="w-full"><button class="float-right bg-indigo-800 text-white p-2 px-4 rounded" name="addTemplate" id="addTemplate" type="submit">&plus; add</button></fieldset></form><div id="templatesTableHead" class="w-full grid grid-cols-5" style="padding-bottom: 4px"><div class="p-3 text-indigo-300 bg-indigo-600 col-span-2 lg:col-span-1 rounded-l">Keys</div><div class="p-3 text-indigo-200 bg-indigo-500 col-span-3 lg:col-span-4 rounded-r">Snippet</div></div><div><template x-for="template in templates"><div class="w-full grid grid-cols-5" style="padding-bottom: 1px"><div x-html="template.hotkeys" class="p-3 bg-indigo-300 text-indigo-800 col-span-2 lg:col-span-1 rounded-l"></div><div class="p-3 bg-indigo-200 text-indigo-700 col-span-3 lg:col-span-4 rounded-r"><div x-html="template.template" class="float-left"></div><div class="float-right"><button class="fas fa-trash" x-on:click="deleteTemplate({hotkeys:template.hotkeys,template:template.template})"></button></div></div></div></template></div></div></div><div class="w-full p-2 mt-4"><button class="text-sm px-3 py-1 rounded float-left border border-indigo-800 bg-white hover:bg-indigo-800 text-indigo-800 hover:text-indigo-100" onclick="hideSnippets()">Close</button></div></div>'

//var document.getElementById("templatesFormToggle") = document.getElementById("document.getElementById("templatesFormToggle")");

