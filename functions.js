String.prototype.toCamelCase = function () {
  if (this.split(' ')) {
    var words = this.split(' ')
    index = 0
    words.forEach(word => {
      if (index > 0) words[index] = word[0].toUpperCase() + word.slice(1)
      index++
    })
    return words.join('')
  }
}

if(!localStorage.getItem('regions')){
  localStorage.setItem('regions','[]')
}

async function setEditorHeight () {
  const body = document.body
  const editor = document.getElementById('captionsPlayground')
  const height = Math.floor(body.clientHeight - editor.offsetTop) - 16
  editor.style.height = height + 'px'
}

//refreshLines();
var shortcutKeys = [13, 37, 38, 39, 40, 46]

let globalPeaks

//App Functions start here

function createHover (targetId, triggerId) {
  var targetElement = document.getElementById(targetId)
  var trigger = document.getElementById(triggerId)
  function showMenu (e) {
    var pos = Number(e.y - e.offsetY) + trigger.offsetHeight + 8
    targetElement.style.top = pos + 'px'
    targetElement.style.left = e.pageX - e.offsetX + 'px'
    targetElement.classList.remove('hidden')
    trigger.title = 'DoubleClick to close Menu'
  }
  trigger.onmouseenter = function (e) {
    //setTimeout(showMenu(e), 2000)
  }
  targetElement.onmouseleave = function (e) {
    targetElement.classList.add('hidden')
    trigger.title = 'Click or hover here to show menu.'
    targetElement.style.zIndex = '1000'
  }
  targetElement.onmouseenter = function () {
    //targetElement.classList.remove('hidden')
    targetElement.title = 'Move away to close menu.'
    targetElement.style.zIndex = '1100'
  }
  trigger.ondblclick = function () {
    targetElement.classList.add('hidden')
    trigger.title = 'Click to open Menu'
  }
  trigger.onclick = function (e) {
    showMenu(e)
  }
}

function saveMediaFile (id) {
  const element = document.getElementById(id)
  element.addEventListener('click', e => {
    const url = window.mediaFileURL
    const link = document.createElement('a')
    link.setAttribute('download', localStorage.currentVideo)
    link.href = 'video/nasa.mp4'
    link.target = '_BLANK'
    link.click()
  })
}

function uploadCaption (element) {
  element.addEventListener('click', async () => {
    const options = {
      startIn: 'documents',
      types: [
        {
          description: 'Subtitle Files (.srt, .vtt, .ass)',
          accept: {
            'text/vtt': ['.vtt'],
            'text/srt': ['.srt'],
            'text/ass': ['.ass']
          }
        }
      ]
    }
    const [handle] = await parent.window.showOpenFilePicker(options)
    let file = await handle.getFile()
    localStorage.setItem('lastModifiedFile', file.name)
    var captionsReader = new captionReader(file)
    captionsReader.readFile()
    localCaptionsClass.seedRegions(JSON.parse(localStorage.regions))
    setTimeout(resetCaptionsDiv(), 100)
  })
}

function generateName () {
  let baseName =
    localStorage.getItem('captionName') + localStorage.getItem('captionType')
  return new Promise((resolve, reject) => {
    const baseNames = baseName.split('.')
    let done = false
    const l = baseNames.length
    if (l >= 2) {
      const last = baseNames[l - 1]
      const secondLast = baseNames[l - 2]
      baseName = baseName.replace(
        `${secondLast}.${last}`,
        `${secondLast + last}`
      )
      done = true
    } else {
      ;[baseName] = baseNames
      done = true
    }
    if (done) resolve(baseName)
    else reject('Failed to get name')
  })
}

function saveSubtitleAs (element) {
  element.addEventListener('click', async () => {
    const name = await generateName()
    const fileHandle = await self.showSaveFilePicker({
      suggestedName: name,
      startIn: 'documents',
      types: [
        {
          description: 'Subtitle files *(.srt, .vtt, .ass)',
          accept: {
            'text/vtt': ['.vtt'],
            'text/srt': ['.srt'],
            'text/ass': ['.ass']
          }
        }
      ]
    })
    const writable = await fileHandle.createWritable()
    let contents = callParser(fileHandle.name)
    console.log()

    // Write the contents of the file to the stream.
    await writable.write(contents)
    // Close the file and write the contents to disk.
    await writable.close()
  })
}

function saveSubtitle (element) {
  element.addEventListener('click', async () => {
    const name = await generateName()
    const fileHandle = await self.showSaveFilePicker({
      suggestedName: name,
      startIn: 'documents',
      types: [
        {
          description: 'Subtitle files *(.srt, .vtt, .ass)',
          accept: {
            'text/vtt': ['.vtt'],
            'text/srt': ['.srt'],
            'text/ass': ['.ass']
          }
        }
      ]
    })
    const writable = await fileHandle.createWritable()

    console.log(fileHandle)
    let contents = callParser(fileHandle.name)
    // Write the contents of the file to the stream.
    await writable.write(contents)
    // Close the file and write the contents to disk.
    await writable.close()
  })
}

function newSubtitle (element) {
  element.addEventListener('click', async () => {
    var clear = confirm('Are you sure? Start captioning afresh?')
    let deleted = false
    if (clear) {
      deleted = await clearCaptions()
      if (deleted) {
        resetCaptionsDiv()
      }
    }
  })
}

function newLine (element) {
  element.addEventListener('click', function () {
    createCaption()
  })
}

function regionLoop (element) {
  element.addEventListener('click', () => {
    if (element.attributes['data-action'] == 'playLoop') {
      playLoop()
      //console.log('supposed to play')
      //setTimeout(element.setAttribute('data-action','pauseLoop'),1000)
    }
  })
}

function copyCaption (element) {
  element.addEventListener('click', function (e) {
    doCopy()
    e.stopPropagation()
  })
}

function doCopy () {
  var node = document.getElementById(getLastElementId())
  let selected
  if (node.setSelectionRange) {
    node.setSelectionRange(0, node.value.length)
    node.select()
    selected = node.value
  }
  navigator.clipboard.writeText(selected)
}
function pasteCaption (element) {
  element.addEventListener('click', e => {
    doPaste()
    e.stopPropagation()
  })
}

function doPaste () {
  const node = document.getElementById(getLastElementId())
  navigator.clipboard.readText().then(textRead => {
    node.value += textRead
    const id = getLastElementId()
    const lineNumber = id.match(/[0-9]*/g).join('')
    let region = localCaptionsClass.regionsData[lineNumber - 1]
    region.data.note = node.value
    //console.log(region, node.value)
    const regionId = region.regionId
    const wavesurferRegion = wavesurfer.regions.list[regionId]
    wavesurferRegion.update({
      data: {
        note: node.value,
        lineNumber: lineNumber
      }
    })
    localCaptionsClass.updateRegion(lineNumber, region)
  })
}

function cutText (element) {
  element.addEventListener('click', e => {
    doCutText(getLastElementId())
    e.stopPropagation()
  })
}

function newLine (element) {
  element.addEventListener('click', e => {
    createCaption()
    e.stopPropagation()
  })
}

function addBefore (element) {
  element.addEventListener('click', e => {
    var id = getLastLinenumber()[0]
    insertCaption(id, 'before')
    e.stopPropagation()
  })
}

function addAfter (element) {
  element.addEventListener('click', e => {
    var id = getLastLinenumber()[0]
    insertCaption(id, 'after')
    e.stopPropagation()
  })
}

function mergeLines (element) {
  element.addEventListener('click', e => {
    mergeCaptions()
    setTimeout(resetCaptionsDiv(), 100)
    e.stopPropagation()
  })
}

function deleteLines (element) {
  element.addEventListener('click', e => {
    doDelete()
    e.stopPropagation()
  })
}

const doDelete = (selected = []) => {
  let ids = []
  let linesDeleted = 0
  const checked = selected
    ? selected
    : document.querySelectorAll('input[type="checkbox"]:checked')
  const toDelete =
    checked.length > 0
      ? checked
      : [document.getElementById('note' + getLastLinenumber()[0])]

  for (let index = 0; index < toDelete.length; index++) {
    const el = toDelete[index]
    const elementId = el.id
    const lineNumber = elementId.match(/[0-9]+/g)[0]
    const id = Number(lineNumber) - (linesDeleted + 1)
    removeCaptionCue(id, video)
    ids.push(id)
    linesDeleted++
  }
  const regions = localCaptionsClass.deleteRegions(...ids)
  //console.log(regions.forEach)
  regions.forEach(regionId => {
    if (regionId !== undefined) {
      const wRegion = wavesurfer.regions.list[regionId]
      //console.log(wRegion)
      wRegion && wRegion.remove() ? wRegion.remove() : null
    }
  })

  unCheckBoxes()
  resetCaptionsDiv()
}

function checkAll (element) {
  element.addEventListener('click', e => {
    var checkBoxes = document.forms[0].querySelectorAll(
      'input[type="checkbox"]'
    )
    checkBoxes.forEach(checkbox => {
      checkbox.checked = true
    })
    e.stopPropagation()
  })
}

function unCheckAll (element) {
  element.addEventListener('click', e => {
    unCheckBoxes()
    e.stopPropagation()
  })
}

function unCheckBoxes () {
  var checkBoxes = document.forms[0].querySelectorAll('input[type="checkbox"]')
  checkBoxes.forEach(checkbox => {
    checkbox.checked = false
  })
}

function getLastElementId () {
  var lastEdit = JSON.parse(localStorage.lastEdited)
  documentId = lastEdit.documentId
  return documentId
}

function getLastLinenumber () {
  var docId = getLastElementId()
  return docId.match(/[0-9]+/)
}

function getLineNumber (elementId) {
  return Number(elementId.match(/[0-9]+/)[0])
}

function mergeCaptions () {
  let id,
    newCaption = '',
    timeDifference
  var selectedCaptions = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  )
  const selectionLength = selectedCaptions.length
  var ids = []
  for (let index = 0; index < selectedCaptions.length; index++) {
    const element = selectedCaptions[index]
    id = getLineNumber(element.id)
    ids.push(id - 1)
  }

  var consequtiveIds = []
  const [firstCheckBox] = selectedCaptions
  const lastCheckBox = selectedCaptions[selectionLength - 1]
  console

  for (
    let index = getLineNumber(firstCheckBox.id);
    index < getLineNumber(lastCheckBox.id) + 1;
    index++
  ) {
    consequtiveIds.push(index)
  }

  const comparison = compareArrays(ids, consequtiveIds)
  //console.log(comparison, ids, consequtiveIds)

  try {
    if (!comparison) {
      throw new EvalError('Selected captions are not consequtive')
    }
    ids.forEach(id => {
      var reg = localCaptionsClass.getRegion(id)
      newCaption += '<br/>' + reg.data.note
    })

    var lines = newCaption.split('<br/>') || [newCaption]
    lines.forEach((line, index) => {
      if (line.length > 40) {
        //console.log(index + 1, ' -> ', line)
        throw new RangeError(
          `line ${index + 1} of resulting caption exceeds 40 characters.`
        )
      }
    })

    /**
     * Check whether the new caption will go for longer than & seconds
     */
    //console.log(ids[0], ids)
    const firstRegion = localCaptionsClass.getRegion(ids[0])
    const lastRegion = localCaptionsClass.getRegion(ids[ids.length - 1])
    timeDifference = lastRegion.end - firstRegion.startIn

    if (timeDifference > 7) {
      throw new EvalError('Resulting caption goes for longer than 7 seconds.')
    } else if (timeDifference < 1) {
      throw new EvalError('Resulting caption goes for less than a second.')
    }

    firstRegion.data.note = newCaption
    firstRegion.end = lastRegion.end
    const selected = [...selectedCaptions].slice(1)

    wavesurfer.regions.list[firstRegion.regionId].update(firstRegion)
    doDelete(selected)
    resetCaptionsDiv()
    document.getElementById('note' + (ids[0] + 1)).focus()
  } catch (err) {
    alert(err)
  }
}

function doCutText (docId) {
  //console.log('id -> ', docId)
  const node = document.getElementById(docId)
  const line = getLastLinenumber()
  const selectStart = node.selectionStart
  const selectEnd = node.selectionEnd
  let updated
  if (selectEnd == selectStart) {
    console.warn('nothing to cut')
  }
  if (selectEnd - selectStart != node.value.length) {
    var subStr1 = node.value.slice(0, selectStart)
    var subStr2 = node.value.slice(selectEnd)
    updated = subStr1.concat(subStr2)
  } else {
    updated = ''
  }
  var rawRegion = localCaptionsClass.getRegion(line - 1)
  rawRegion.data.note = updated
  localCaptionsClass.updateRegion(line, rawRegion)
  var updatedReg = localCaptionsClass.getRegion(line - 1)
  //console.log(updatedReg, node)
  resetCaptionsDiv()
  goToLastEdit()
}

async function clearCaptions () {
  let clearedRegions = false
  const deletedLocal = localCaptionsClass.emptyRegions()
  if (deletedLocal) {
    //console.log('deleted', wavesurfer)
    wavesurfer.clearRegions()
    localStorage.lastEdited = '{}'
    document.querySelector('video').load()
    clearedRegions = true
  }

  removeCues(video)

  window.location.replace('test.html')
  return clearedRegions
}

const removeCues = element => {
  while (video.textTracks[0].cues.length > 0) {
    for (let index = 0; index < video.textTracks[0].cues.length; index++) {
      const cue = video.textTracks[0].cues[index]
      video.textTracks[0].removeCue(cue)
    }
    video.textTracks[0]
  }
}

function parseVTT () {
  //parse regions to VTT format
  captionCreator.captionsArray = localCaptionsClass.regionsData
  return captionCreator.createGlob('vtt')
}

function parseASS () {
  //write regions to Ass format
  captionCreator.captionsArray = localCaptionsClass.regionsData
  return captionCreator.createGlob()
}

function parseSRT () {
  //parse regions to srt format
  captionCreator.captionsArray = localCaptionsClass.regionsData
  return captionCreator.createGlob('srt')
}

function fileExtension (filename) {
  if (filename.includes('.')) {
    var splits = filename.split('.')
    return splits[splits.length - 1]
  }
}
function callParser (filename) {
  var type = fileExtension(filename).toUpperCase()
  //console.log(type)
  switch (type) {
    case 'VTT':
      return parseVTT()
    case 'SRT':
      return parseSRT()
    case 'ASS':
      return parseASS()
    default:
      console.warn('Unknown type')
      return 'unknown type'
  }
}

//End of App functions

function playTyping () {
  if (localStorage.pauseKeyUp === 'true') {
    return true
  }
  return false
}

function playLoop () {
  let regionId, index, region
  var lastEdit = JSON.parse(localStorage.lastEdited)
  var docId = lastEdit.documentId
  var [id] = docId.match(/[0-9]./g)
  //console.log(id)
  index = id - 1
  regionId = localCaptionsClass.getRegion(index).regionId
  region = wavesurfer.regions.list[regionId]
  region.playLoop()
  var playLoopEl = document.getElementById('playLoop')
  var pauseLoopEl = document.getElementById('pauseLoop')
  pauseLoopEl.classList.add('hidden')
  playLoopEl.classList.add('hidden')
}

function pauseLoop () {
  let regionId, index, region
  var lastEdit = JSON.parse(localStorage.lastEdited)
  var docId = lastEdit.documentId
  var [id] = docId.match(/[0-9]./g)
  //console.log(id)
  index = id - 1
  regionId = localCaptionsClass.getRegion(index).regionId
  region = wavesurfer.regions.list[regionId]
  wavesurfer.pause()
  var playLoopEl = document.getElementById('playLoop')
  var pauseLoopEl = document.getElementById('pauseLoop')
  pauseLoopEl.classList.add('hidden')
  playLoopEl.classList.remove('hidden')
  document.getElementById('regionLoop').setAttribute('data-action', 'playLoop')
}

function processShortcutData (data) {
  let keysArray, processed
  keysArray = data.split('+')
  processed = []
  keysArray.forEach(key => {
    processed.push('<kbd>' + key.replace(' ', '') + '</kbd>')
  })
  flashMessage(processed.join(' + '), 'editorInfo')
  return processed.join(' + ')
}

function saveLastEdit (e) {
  var docId = e.target.id
  var caretPosition = e.target.selectionEnd || 0
  var dataObj = {
    documentId: docId,
    lastPosition: caretPosition
  }
  localStorage.lastEdited = JSON.stringify(dataObj)
}

function goToLastEdit () {
  if(JSON.parse(localStorage.regions) === []) return
  var lastEditData = JSON.parse(localStorage.lastEdited)
  var el = document.getElementById(lastEditData.documentId)
  try {
    if (lastEditData.lastPosition < 0)
      throw new RangeError('This document has no previous edits!')
    if (!el) throw new RangeError('This caption does not exist!')
    el.selectionEnd = lastEditData.lastPosition
    el.focus()
  } catch (error) {
    console.error(error)
  }
}

function removeCaptionCue (cueIndex, element = video) {
  var track = element.textTracks[0]
  var cues = track.cues
  var cue = cues[cueIndex]
  //console.log(cue)
  track.removeCue(cue)
}

function createCaptionCue (cueIndex, region, element = video) {
  var track = element.textTracks[0]
  cue = new VTTCue(
    region.start,
    region.end,
    processCaptionString(region.data.note)
  )
  var retval = track.addCue(cue)
  //console.log(retval)
  return retval
}

function recalculateLineNumbers (obj) {
  var storedObj = JSON.parse(obj)
  var count = 1
  storedObj.forEach(subObj => {
    if (subObj.data.lineNumber) {
      subObj.data.lineNumber = count
    }

    count += 1
  })
  localStorage.regions = JSON.stringify(storedObj)
}

function insertCaption (id, pos) {
  id = Number(id)
  let index
  let regionToUpdate
  let currentregion
  let baseValue
  switch (pos) {
    case 'before':
      index = id
      currentregion = localCaptionsClass.regionsData[id - 1]
      baseValue = parseFloat(currentregion.start)
      regionToUpdate = {
        start: (baseValue - 1.01).toFixed(2),
        end: (baseValue - 0.01).toFixed(2),
        data: {
          note: '',
          lineNumber: index
        }
      }
      break
    case 'after':
      index = id + 1
      currentregion = localCaptionsClass.regionsData[id - 1]
      baseValue = parseFloat(currentregion.end)
      regionToUpdate = {
        start: (baseValue + 0.01).toFixed(2),
        end: (baseValue + 1.01).toFixed(2),
        data: {
          note: '',
          lineNumber: index
        }
      }
      break

    default:
      break
  }

  regionToUpdate.color = randomColor(0.25)
  var cRegion = wavesurfer.addRegion(regionToUpdate)
  regionToUpdate.regionId = cRegion.id
  localCaptionsClass.insertRegion(Number(index), regionToUpdate)
  cRegion.play()
  resetCaptionsDiv()
  setTimeout(() => {
    document.getElementById('note' + index).focus()
  }, 50)
}

function addTo (to, startvalue, captionNumber) {
  var rawValue = startvalue * 100
  rawValue += 1
  var elem = document.getElementById(to + captionNumber)
  elem.value = (rawValue / 100).toFixed(2)
  elem.setAttribute('value', (rawValue / 100).toFixed(2))
}

function subtractFrom (from, startvalue, captionNumber) {
  var rawValue = startvalue * 100
  if (rawValue == 0) {
  } else {
    rawValue -= 1
    var elem = document.getElementById(from + captionNumber)
    elem.value = (rawValue / 100).toFixed(2)
    elem.setAttribute('value', (rawValue / 100).toFixed(2))
  }
}

function consequtiveRegions (region1, region2) {
  if (
    new Number(region1.data.lineNumber) ===
    new Number(region2.data.lineNumber) - 1
  ) {
    return true
  }
  return false
}

function menu (x, y, docm) {
  docm.style.top = y + 'px'
  docm.style.left = x + 'px'
  docm.style.visibility = 'visible'
  //alert(y)
  docm.style.opacity = '1'
  if (y > 320) {
    y -= 290
    docm.style.top = y + 'px'
  }
}

function * range (_start_, _end_) {
  for (let h = _start_; h <= _end_; h++) {
    yield h
  }
}

function rangeToArray (start, end) {
  var rangeNums = []
  for (h of range(start, end)) {
    rangeNums.push(h)
  }
  return rangeNums
}

function compareArrays (a, b) {
  if (a.length != b.length) return false
  for (let index = 0; index < a.length; index++) {
    if (a.index != b.index) {
      return false
    }
  }
  return true
}

function fetchText (region) {
  var lineNumber = region.data.lineNumber
  var captionVal = document.getElementById('note' + lineNumber)
  var retVal = captionVal.value
  captionVal.onkeyup = function (e) {
    retVal = e.target.value
  }
  console.log('return value: ', retVal)
  return retVal
}

function showNote (region) {
  if (!showNote.el) {
    //showNote.el = document.querySelector('#subtitle')
  }
  showNote.el.style.color = 'white'
  //showNote.el.style.fontSize = 'medium'
  //showNote.el.innerHTML = fetchText(region) || '–'
}

function hideNote (region) {
  if (!hideNote.el) {
    hideNote.el = document.querySelector('#subtitle')
  }
  hideNote.el.style.color = 'white'
  //hideNote.el.style.fontSize = 'medium'
  hideNote.el.textContent = '–'
}

function editAnnotation (region) {
  //console.log(region.id);
  resetCaptionsDiv()
  CaptionId = region.data.lineNumber
  if (document.getElementById('note' + CaptionId) != null) {
    var caption = document.getElementById('note' + CaptionId)
    caption.focus()
  } else {
    //createRegionDom(region)
  }
}

function updateCurrentRegion (el) {
  var captionId = parseInt(el.target.parentElement.id)
  var caption = document.getElementById('note' + captionId)
  var captionRegionVal = document.getElementById('end' + captionId)
  var startVal = document.getElementById('start' + captionId)
  var storedRegions = localCaptionsClass.regionsData
  var localRegion = storedRegions[captionId - 1]
  var regId = localRegion.regionId
  var region = wavesurfer.regions.list[regId]
  var currentRegion = {
    start: startVal.value,
    end: captionRegionVal.value,
    attributes: region.attributes,
    data: {
      note: caption.value,
      lineNumber: captionId
    },
    regionId: regId
  }
  localCaptionsClass.updateRegion(captionId, currentRegion)
  region.update({
    start: currentRegion.start,
    end: currentRegion.end,
    data: currentRegion.data
  })
}

function setCursor (node, pos) {
  node =
    typeof node == 'string' || node instanceof String
      ? document.getElementById(node)
      : node

  if (!node) {
    return false
  } else if (node.createTextRange) {
    var textRange = node.createTextRange()
    textRange.collapse(true)
    textRange.moveEnd(pos)
    textRange.moveStart(pos)
    textRange.select()
    return true
  } else if (node.setSelectionRange) {
    node.setSelectionRange(pos, pos)
    return true
  }

  return false
}

//console.log(window.Wavesurfer)

function mergeSelectedCaptions () {
  var captionsForm = document.getElementById('captionsPlayground')
  var captionsArray = captionsForm.querySelectorAll(
    'input[type="checkbox"]:checked'
  )
  //(captionsArray)

  var mergeString = ''

  var originalCaptionsObject = localCaptionsClass.regionsData
  //an commands of IDs of the selected captions
  var captionNumberArray = []
  try {
    if (parseInt(captionsArray.length) > 1) {
      captionsArray.forEach(element => {
        captionNumberArray.push(parseInt(element.id))
      })
      // an commands of consecutive indices from the first selected caption to the last selected caption
      var expectedCaptionNumbers = rangeToArray(
        parseInt(captionsArray[0].id),
        parseInt(captionsArray[captionsArray.length - 1].id)
      )
      //(captionNumberArray, ' == ', expectedCaptionNumbers)
      try {
        if (compareArrays(captionNumberArray, expectedCaptionNumbers)) {
          captionsArray.forEach(element => {
            let id = element.id
            id = parseInt(id)
            let lastObj = captionsArray[parseInt(captionsArray.length) - 1]
            let columnId = parseInt(captionsArray[0].parentNode.parentNode.id)
            var captionToUpdate = document.getElementById('note' + columnId)

            try {
              if (mergeString.length > 40 && captionsArray[0] !== element) {
                throw new Error('captions cannot exceed 40 characters!')
              } else {
                if (mergeString.endsWith(' ')) {
                  mergeString += document.getElementById('note' + id).value
                } else {
                  mergeString +=
                    ' ' + document.getElementById('note' + id).value
                }

                if (captionsArray[0] !== element) {
                  var parentDiv = captionsArray[0].parentNode.parentNode
                  columnId = parseInt(parentDiv.id)
                } else {
                  return
                }

                var endToUpdate = document.getElementById('end' + columnId)
                var startToUpdate = document.getElementById('start' + columnId)
                var objectToDelete = originalCaptionsObject[id - 1]
                var currentObject = originalCaptionsObject[columnId - 1]
                var deleteRegId = objectToDelete.regionId
                var currentRegId = currentObject.regionId

                //console.log('caption to update: ',captionToUpdate)

                var currentCaption = document.getElementById('note' + id)

                //('last object: ', element)

                if (currentCaption != captionToUpdate) {
                  //var

                  var newEndVal = document.getElementById('end' + id).value
                  //('current end: ', parseFloat(newEndVal))
                  //('newEndVal: ', newEndVal)
                  currentObject.end = parseFloat(newEndVal)
                  currentObject.data.note = mergeString

                  captionsForm.removeChild(element.parentElement.parentElement)

                  //('current object: ', currentObject)
                  //objectToDelete.data.note = mergeString;

                  localStorage.regions = localStorage.regions.replace(
                    currentObject + ',',
                    ''
                  )
                  //(currentObject == objectToDelete)
                  currentObject = originalCaptionsObject[id - 1]
                  var regionToRemove =
                    window.wavesurfer.regions.list[deleteRegId]
                  var regionToUpdate =
                    window.wavesurfer.regions.list[currentRegId]
                  //(' obj to update: ', objectToDelete.regionId)
                  //(' current obj: ', currentObject.regionId)

                  var updateData = {
                    start: parseFloat(startToUpdate.value),
                    end: regionToRemove.end,
                    data: {
                      note: mergeString,
                      lineNumber: regionToUpdate.data.lineNumber,
                      regionId: regionToUpdate.id
                    }
                  }

                  //('update with region: ', updateData)

                  regionToRemove.remove()
                  regionToUpdate.update(updateData)
                  saveRegions()

                  endToUpdate.setAttribute('value', updateData.end)
                  localStorage.regions.replace(
                    JSON.stringify(objectToDelete) + ',',
                    ''
                  )
                  localStorage.regions.replace(
                    JSON.stringify(currentObject),
                    JSON.stringify(updateData)
                  )

                  var numOfCaptions = localStorage.getItem('captionNumber')
                  localStorage.setItem('captionNumber', numOfCaptions - 1)
                }

                //element.parentElement.previousSibling.focus()
                captionToUpdate.setAttribute('value', mergeString)
                captionToUpdate.focus
                //(columnId)
                //document.getElementById('ischecked'+columnId).removeAttribute('checked')
              }
            } catch (error) {
              alert(error)
            }
          })
          //var checkedElements=document.querySelectorAll('input[type="checkbox"]:checked')
        } else {
          throw new Error('The selected captions are not consecutive')
        }
      } catch (error) {
        alert(error)
      }
      //refreshLines()
      //recalculateLineNumbers();
    } else {
      throw new Error('You cannot merge less that two captions')
    }
  } catch (error) {
    alert(error)
  }
}

function removeLastWord (words) {
  let wordsArray = words.split(' ')
  wordsArray.pop()
  return wordsArray.join(' ') + ' '
}
function insertInto (str, input) {
  var val = input.value,
    s = input.selectionStart,
    e = input.selectionEnd
  input.value = val.slice(0, e) + str + val.slice(e)
  if (e == s) input.selectionStart += str.length - 1
  input.selectionEnd = e + str.length - 1
}

function insertFragment (str, input) {
  var val = removeLastWord(input.value),
    s = input.selectionStart,
    e = input.selectionEnd
  input.value = val.slice(0, e) + str + ' ' + val.slice(e)
  if (e == s) input.selectionStart += str.length - 1
  input.selectionEnd = e + str.length
}

function insertBreak (input) {
  var val = input.value,
    s = input.selectionStart,
    e = input.selectionEnd,
    str = '<br/>'
  input.value = val.slice(0, e) + str + val.slice(e)
  if (e == s) input.selectionStart += str.length - 1
  input.selectionEnd = e + str.length
}

function insertMusicGlyph (input) {
  var val = input.value,
    s = input.selectionStart,
    e = input.selectionEnd,
    str = '&sung;   &sung;'
  input.value = val.slice(0, e) + str + val.slice(e)
  if (e == s) input.selectionStart += str.length - 1
  input.selectionEnd = e + str.length / 2
}

//show editor faqs and filter them through a searchbar and a loop
function searchHelp () {
  newData = []
  var searchBox = document.getElementById('search')
  var searchString = searchBox.value
  var searchArray = searchString.split(' ')

  if (searchString.length > 0) {
    var found = false
    index = 0
    helpData.forEach(element => {
      var question = element.question.toLocaleLowerCase()
      found = false
      searchArray.forEach(param => {
        param = param.toLocaleLowerCase()
        if (param) {
          found = question.includes(param)
        }
      })
      if (found) {
        var elem1 = element

        newData.push(elem1)
      }
      index++
    })
    if (newData != []) {
      //(searchArray.join(' '))
      var targetDiv = document.getElementById('loopDiv')
      targetDiv.setAttribute('x-data', '{data:newData}')
      //console.log(targetDiv)
    } else {
      //('nada')
    }
  } else {
    var targetDiv = document.getElementById('loopDiv')
    targetDiv.setAttribute('x-data', '{data:helpData}')
  }
  //('new data ', newData)
}

function processCaptionString (cueTextString) {
  if (cueTextString.length < 1) return ''
  if (cueTextString.match(/\^/gi)) {
    var upCarets = cueTextString.match(/\^/gi)
    //(upCarets)
  }
  cueTextString = cueTextString.replace(/\^/g, '')
  var cueLinesArray = cueTextString.split('<br/>')
    ? cueTextString.split('<br/>')
    : cueTextString
  var speakersArray = []
  index = 0
  cueLinesArray.forEach(cueLine => {
    var speaker = cueLine.match(/(.*):/gi)
    //('speaker: ', speaker)

    if (speaker !== null) {
      speaker = speaker[0]
      if (!speakersArray.indexOf(speaker)) {
        speakersArray.push(speaker)
      }
      if (index == 0) {
        cueLine = cueLine.replace(
          speaker,
          '<v.' + speaker + '.first>' + speaker + '</v>'
        )
      } else {
        cueLine = cueLine.replace(speaker, '<v>' + speaker + '</v>')
      }
    }
    //('spaekers: ', speakersArray)

    cueLine = cueLine
      .replace('[laughs]', '<i.laughs>[laughs]' + '</i>')
      .replace('[laughter]', '<i.laughter>[laughter]' + '</i>')
      .replace(/&sung;/g, '<i.sung>&sung;</i>')
    cueLine = cueLine.replace('(dialing)', '<i.dialing>(dialing)' + '</i>')
    cueLine = cueLine
      .replace('(phone ringing)', '<i.phone-ringing>(phone ringing)' + '</i>')
      .replace('\r', '')
    cueLinesArray[index] = cueLine
    index++
  })
  //console.log(this.element)
  if (cueLinesArray.length > 0 && cueLinesArray.length < 3) {
    var returnString = cueLinesArray.join(' \n')
  }
  returnString = returnString.replace(': ', ' ')
  return {
    cueTex: returnString,
    speakers: speakersArray
  }
  //console.log(captionString.replace(/[.":"]/),speaker)
}

function escapeQuotes (caption) {
  var res = caption.replace(/'\r'/g, '').replace(/\"/g, '"')
  return res
}

// see that a caption is correctly formated
function validateCaption (caption, start, end) {
  var lines = caption.split('<br/>')
    ? caption.split('<br/>')
    : new Array(caption)
  var errors = []

  var diff = end - start
  var cpsValue = caption.length / diff //get Characters per seconds. ideally below 20
  if (cpsValue > 20) {
    errors.push({
      message: 'Exceeds 20 cps. Many people read slower',
      styling: 'text-red-500'
    })
  }

  if (lines.length > 2) {
    errors.push({
      message: 'Caption has more than two lines',
      styling: 'text-red-500 text-opacity-100'
    })
  }
  if (lines[1] && lines[0].length > lines[1].length) {
    errors.push({
      message: 'Aesthetics: line one should be shorter or equal to line two',
      styling: 'text-yellow-600'
    })
  }

  if (diff < 1) {
    errors.push({
      message: 'A caption cannot go for less than a second.',
      styling: 'text-red-500'
    })
  }

  if (diff > 7) {
    errors.push({
      message: 'A caption cannot go for more than seven seconds.',
      styling: 'text-red-500'
    })
  }
  var lineNumber = 1
  lines.forEach(line => {
    if (line.length > 38 && line.length < 41) {
      errors.push({
        message: 'line ' + lineNumber + '-> consider ending this line here',
        styling: 'text-yellow-600'
      })
    }
    if (line.length > 40) {
      errors.push({
        message: 'line ' + lineNumber + '-> has more than forty Characters',
        styling: 'text-red-500 text-opacity-90'
      })
    }
    lineNumber++
  })
  var errorsDiv = document.getElementById('errors')
  errorsDiv.setAttribute(
    'x-data',
    '{errorsData:' + JSON.stringify(errors) + '}'
  )

  if (errors.length > 0) {
    errorsDiv.classList.remove('hidden')
  } else {
    errorsDiv.classList.add('hidden')
  }
  //console.log(errorsDiv)
  return errors
}

function snippetListener (e) {
  let wordStr = e.target.value
  var words = wordStr.split(' ')
  var position = e.target.selectionStart
  if (wordStr[position] == ' ') {
    var wordAt = wordAtIndex(position + 1, words)
  } else {
    var wordAt = wordAtIndex(position, words)
  }
  var templates = JSON.parse(localStorage.templates)
  var returnTemplate
  templates.forEach(template => {
    var templateKeys = template.hotkeys
    if (templateKeys == wordAt) {
      insertFragment(template.template, e.target)
      returnTemplate = template
    }
  })
  return {
    returnTemplate: returnTemplate,
    selectStart: e.target.selectStart,
    insertPos: position
  }
}
function wordAtIndex (index, strArr) {
  length = 0
  var word
  //(index)
  strArr.forEach(str => {
    if (index > length) {
      //(length,' ',str)
      length += str.length + 1
      if (length >= index) {
        word = str
      }
    }
  })
  return word
}

function reconstructTime (timestamp, type = 'vtt') {
  timestamp = timestamp.replace(',', ':').replace('.', ':')
  var timestampParts = timestamp.split(':')
  var milliseconds = timestampParts[3]
  var hourVal = timestampParts[0] * 60 * 60
  var minuteVal = timestampParts[1] * 60
  var secondsVar = timestampParts[2]
  var seconds = new Number(
    parseInt(hourVal) + parseInt(minuteVal) + parseInt(secondsVar)
  )
  var secondsSeparator = ''
  switch (type) {
    case 'vtt':
      secondsSeparator = '.'
      break
    case 'srt':
      secondsSeparator = ','
  }
  const retVal = seconds.toString() + secondsSeparator + milliseconds
  console.log('timestamp: ', retVal)
  return retVal
}
function reconstructObject (element) {
  elementsArray = element.split('\n')

  if (typeof elementsArray[1] == 'string') {
    var lineNumberVal = elementsArray[0]
    var timestamps = elementsArray[1].split(' --> ')
    var startTime = reconstructTime(timestamps[0], 'vtt')
    var endTime = reconstructTime(timestamps[1], 'vtt') - 0.01
    let noteVal = elementsArray[2]
    if (elementsArray[3]) {
      noteVal += '<br/>' + elementsArray[3]
    }
    if (noteVal === '' || noteVal === 'undefined') noteval = ''
    console.log(noteVal)
    console.log('three ', elementsArray[2])
    console.log('four ', elementsArray[3], '\n')
    var captionObject = {
      start: startTime,
      end: endTime,
      data: {
        lineNumber: lineNumberVal,
        note: escapeQuotes(noteVal)
      }
    }
    captionObject = JSON.parse(JSON.stringify(captionObject))
    console.log(captionObject)
    if (captionObject != undefined) {
      return captionObject
    }
  }
}

//create a click event listener on the upload caption button
function uploadCaption (element) {
  element.addEventListener('click', async () => {
    const options = {
      types: [
        {
          description: 'Subtitle Files (.srt, .vtt, .ass)',
          accept: {
            'text/vtt': ['.vtt'],
            'text/srt': ['.srt'],
            'text/ass': ['.ass']
          }
        }
      ]
    }
    const [handle] = await parent.window.showOpenFilePicker(options)
    let file = await handle.getFile()
    var captionsReader = new captionReader(file)
    captionsReader.readFile()
    var video = document.querySelector('video')
    video.load()
    resetCaptionsDiv()
  })
}

//listen for uploads

function uploadVideo (element) {
  element.addEventListener('click', async () => {
    const options = {
      types: [
        {
          description: 'Video Files (.srt, .vtt, .ass)',
          accept: {
            'media/mp4': ['.mp4']
          }
        }
      ]
    }
    const [handle] = await parent.window.showOpenFilePicker()
    let file = await handle.getFile()
    console.log(file)
    var mediaFilename = file.name.match(/.+\./g)[0]
    localStorage.videoName = mediaFilename
    var video = document.querySelector('video')
    var videoUrl = URL.createObjectURL(file)
    var sourceElement = document.createElement('source')
    sourceElement.src = videoUrl

    video.src = videoUrl
    //video.load()
    fetch('./nasa.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error ' + response.status)
        }
        return response.json()
      })
      .then(peaks => {
        console.log('loaded peaks! sample_rate: ' + peaks.sample_rate)
        wavesurfer.load(video, peaks.data)
      })
      .catch(e => {
        console.error('error', e)
      })
  })
}

function loadCaptionsFromFile (filedata) {
  localStorage.regions = JSON.stringify(filedata)
}

function resetCaptionsDiv () {
  var captionsDiv = document.getElementById('captionsPlayground')
  captionsDiv.setAttribute(
    'x-data',
    '{captions:' + JSON.stringify(localCaptionsClass.regionsData) + '}'
  )
}

function removeElementsChildren (elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild)
  }
}

function inputError (input, required = new String()) {
  var typeString = typeof input
  if (typeof input === required.toLowerCase()) return
  console.error(
    'Id must be an integer. ' +
      typeString[0].toUpperCase() +
      typeString.slice(1) +
      ' entered'
  )
  return true
}

function flashMessage (message = new String(), targetId = new String()) {
  if (inputError(message, 'string') || inputError(targetId, 'string')) return
  var elem = document.getElementById(targetId)
  elem.textContent = message
  elem.classList.remove('hidden')
  setTimeout(() => {
    document.getElementById(targetId).classList.add('hidden')
  }, 1500)
}
function parseData (data, callback = () => {}) {
  if (typeof Worker !== 'undefined') {
    if (typeof w == 'undefined') {
      w = new Worker('./customWorker.js')
    }
    w.postMessage(data)

    w.onmessage = function (event) {
      callback(data)
      return event.data
    }
  } else {
    return 'Oops! Browser does not support web workers'
  }
}

function stopParsingData () {
  w.terminate()
  w = undefined
}
function * yieldRegions () {
  var data = JSON.stringify(localStorage.regions)
  for (let index = 0; index < data.length; index++) {
    const element = data[index]
    yield element
  }
}
function loadCaptionsFromLocalStorage () {
  if (!window.wavesurfer.regions.list) return
  var wavesurfer = window.wavesurfer
  for (caption of yieldRegions()) {
    caption.color = randomColor(0.25)
    wavesurfer.addRegion(caption)
  }
}

function zoomWaveformIn () {
  if (waveformZoom < 450) {
    waveformZoom += 25
    document.getElementById('zoomEl').textContent = parseFloat(
      waveformZoom / 150
    ).toFixed(2)
  }
  // console.log(waveformZoom);
  wavesurfer.zoom(waveformZoom)
  //wavesurfer.zoom(Number(this.value));
}
function zoomWaveformOut () {
  if (waveformZoom > 150) {
    waveformZoom -= 25
    document.getElementById('zoomEl').textContent = parseFloat(
      waveformZoom / 150
    ).toFixed(2)
  }
  // console.log(waveformZoom);
  wavesurfer.zoom(waveformZoom)
}

/**
 * Display annotation.
 */
//wavesurfer.unAll()
//var rateEl = document.getElementById('playbackRate')

function raiseVolume () {
  if (wavesurfer.getVolume() <= 1) {
    wavesurfer.setVolume(wavesurfer.getVolume() + 0.01)
  }
}

function lowerVolume () {
  if (wavesurfer.getVolume() >= 0) {
    wavesurfer.setVolume(wavesurfer.getVolume() - 0.01)
  }
}
function skipBackward () {
  wavesurfer.skipBackward()
}
function skipForward () {
  wavesurfer.skipForward()
}

function raisePlayrate () {
  //console.log(wavesurfer.getPlaybackRate())
  if (wavesurfer.getPlaybackRate() < 3.0) {
    wavesurfer.setPlaybackRate(wavesurfer.getPlaybackRate() + 0.1)
    //rateEl.textContent = wavesurfer.getVolume()
  }
}

function lowerPlayrate () {
  if (wavesurfer.getPlaybackRate() > 0.7) {
    wavesurfer.setPlaybackRate(wavesurfer.getPlaybackRate() - 0.1)
    //rateEl.textContent = wavesurfer.getVolume()
  } else {
    //console.assert('max volume reached')
  }
}

//use this function to determine this waveregion and update something
function lineRegion (line) {
  var result = []
  var regionsObj = wavesurfer.regions.list
  //console.log(typeof regionsObj)

  for (const key in regionsObj) {
    if (Object.hasOwnProperty.call(regionsObj, key)) {
      const element = regionsObj[key]
      if (element.data.lineNumber === line) {
        result.push(element)
      }
    }
  }

  //console.log('regions in line ', result)
  return result
}

function syncRegions () {
  var wRegions = wavesurfer.regions.list
  var lRegions = singList.dataObject()
  var sRegions = localCaptionsClass.regionsData
  //assingn the new regions to localStorage regions
  for (let index = 0; index < sRegions.length; index++) {
    const wRegion = wRegions[index]
    regionIndex = parseInt(wRegion.data.lineNumber) - 1
    var lRegion = lRegions[regionIndex]
    lRegion.regionId = wRegion.id
    lRegions[regionIndex] = lRegion
  }

  localStorage.removeItem('regions')
  localStorage.regions = JSON.stringify(lRegions)
  window.document.title = lRegions[0].data.note
}

async function loadNewData (dataArray) {
  var clearedRegions = await wavesurfer.clearRegions()
  if (clearedRegions) {
    var wavesurferRegions = await loadRegionsAsync(dataArray)
    localCaptionsClass.seedRegions(wavesurferRegions)
  }
}

function loadRegionsPromise (regions) {
  return new Promise((resolve, reject) => {
    const result = []
    let reason = `${typeof regions} is not valid! A non-empty array required.`
    if (regions.length > 0) {
      regions.forEach(region => {
        region.color = randomColor(0.25)
        var added = wavesurfer.addRegion(region)
        region.regionId = added.id
        result.push(region)
      })
    }
    if (result.length > 0) resolve(result)
    else reject(reason)
  })
}

async function loadRegionsAsync (regions) {
  flashMessage('loading regions...', 'editorInfo')
  var result = loadRegionsPromise(regions)
  flashMessage('loaded succesfully', 'editorInfo')
  return result
}

// load a video from indexedDB or fetch from Url if not in local storage

function loadVideo (url = false, target = false) {
    if (url == false) {
      url = localStorage.videoUrl
    }
    localStorage.videoUrl = url
    let db
    //document.querySelector("video").remove();
    //console.log(localStorage.currentVideo)
    var openConnection = window.indexedDB.open('video_storage', 1)
    openConnection.addEventListener('error', () => {
      console.alert('Failed to connect to videos database')
    })
    openConnection.addEventListener('success', () => {
      //console.info('connection successful')
      db = openConnection.result
      videoInit()
      //console.log(db)
    })
    openConnection.addEventListener('upgradeneeded', e => {
      db = e.target.result
      const videosTable = db.createObjectStore('videos', {
        keyPath: 'name'
      })
      //console.log('created Videos Table')
      videosTable.createIndex('name', 'name', { unique: true })
      videosTable.createIndex('mp4Blob', 'mp4Blob', { unique: false })
    })
    //console.log(db, ' out')
  
    function fetchVideo (videoUrl) {
      localStorage.setItem('videoUrl', videoUrl)
      let mp4Blob
      let baseName
      createVideo(videoUrl)
      const videoData = fetch(videoUrl).then(response => response.blob())
      Promise.all([videoData]).then(values => {
        mp4Blob = values[0]
        baseName = videoName(videoUrl)
        //removeVideo()
        showVideo(mp4Blob)
        storeVideo(baseName, mp4Blob)
      })
    }
    function storeVideo (baseNamev, mp4Blobv) {
      const videoStore = db
        .transaction(['videos'], 'readwrite')
        .objectStore('videos')
      const videoReq = videoStore.add({
        name: baseNamev,
        mp4Blob: mp4Blobv
      })
  
      setVideoName(url)
      flashMessage('name set \n storing... now', 'editorInfo')
      videoReq.addEventListener('success', e => {
        flashMessage('added successfully -> ' + baseNamev, 'editorInfo')
      })
      videoReq.addEventListener('error', () => {
        flashMessage(videoReq.error, 'editorInfo')
      })
    }
  
    function showVideo (mp4) {
      let mp4URL, captionsCreator
      mp4URL = URL.createObjectURL(mp4)
      setVideoName(url)
      var video = document.querySelector('video')
      video.load()
      video.src = mp4URL
    }
  
    function videoName (videoUrl) {
      const videoSlugs = videoUrl.split('/')
      const numSlugs = videoSlugs.length
      return videoSlugs[numSlugs - 1]
    }
  
    function setVideoName (url) {
      var vidName = videoName(url)
      if (localStorage.currentVideo != vidName) {
        localStorage.currentVideo = vidName
      }
    }
  
    function createVideo (url) {
      var video = document.createElement('video')
      video.type = 'video/mpeg'
      var source = document.createElement('source')
      video.controls = 'true'
      video.style = 'display: block; margin: 0 auto'
      video.classList = 'border-white shadow shadow-xl border'
      source.src = url
      video.appendChild(source)
      return video
    }
    function removeVideo () {
      document.querySelector('video').remove()
    }
  
    function videoInit () {
      var videoname = localStorage.currentVideo
      if (videoname != videoName(localStorage.videoUrl)) {
        fetchVideo(localStorage.videoUrl)
      }
      //console.log(db)
      const videoStore = db.transaction('videos').objectStore('videos')
      const videoRequest = videoStore.get(videoName(localStorage.videoUrl))
      //console.log(videoRequest)
      videoRequest.addEventListener('success', () => {
        if (videoRequest.result) {
          flashMessage('found...', 'editorInfo')
          showVideo(
            videoRequest.result.mp4Blob,
            videoRequest.result.mpegBlob,
            videoRequest.result.baseName
          )
        } else {
          flashMessage('not found. Storing...', 'editorInfo')
          fetchVideo(localStorage.videoUrl)
        }
      })
    }
  }
