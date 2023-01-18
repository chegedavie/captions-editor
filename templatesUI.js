class templatesUi {
    constructor () {
      this.templates = new snippetStore()
      this.defaultTemplates = [
        {
          hotkeys: 'Alt + 1',
          template: 'Speaker 1'
        },
        {
          hotkeys: 'Alt + 2',
          template: 'Speaker 2'
        }
      ]
      //this.loadDefault()
      //console.log(this.templates)
    }
    addTemplate (currentObject) {
      var res = this.checkIfExists(currentObject)
      if (this.templates) {
        //console.log('res not empty ', res)
        if (res.Exists == false) {
          //console.log('currentObject ', currentObject)
          this.templates.addSnippet(currentObject)
        } else {
          var alertString = 'template already Exists'
          if (res.hotkeyMessage.length > 0) {
            alertString += '\n' + res.hotkeyMessage
          }
          if (res.snippetMessage.length > 0) {
            alertString += '\n' + res.snippetMessage
          }
          alert(alertString)
        }
      }
    }
  
    setTemplate (index, template) {
      this.templates.editSnippet(index, template)
    }
    getTemplate (index) {
      return this.templates.getSnippet(index)
    }
    removeTemplate (index) {
      if (this.templates.snippets.length > 0 && typeof index == 'number') {
        this.templates.removeSnippet(index)
      }
    }
  
    listTemplates () {
      return this.templates
    }
    searchTemplates (query = false) {
      var templatesArray = this.templates.snippets
      var resultsArray = []
      if (templatesArray.length > 0) {
        templatesArray.forEach(element => {
          var elementText = element.template
          if (query != false && elementText != undefined) {
            elementText = elementText.toLowerCase()
            query = query.toLowerCase()
            if (elementText.search(query) != -1) {
              resultsArray.push(element)
            }
          } else {
            resultsArray.push(element)
          }
        })
      }
      return resultsArray
    }
  
    checkIfExists (query) {
      var templatesArray = this.templates.snippets
      var elemExists = false
      var keyExists = false
      var elemMessage = ''
      var keyMessage = ''
      var templateExists = false
      if (templatesArray.length > 0) {
        templatesArray.forEach(element => {
          var elementText = element.template
          var elementKeys = element.hotkeys
          //console.log(element)
  
          if (query != false) {
            if (elementText != undefined && elementText.length > 0) {
              elementText = elementText.toLowerCase()
              var query1 = query.template.toLowerCase()
              if (elementText.search(query1) != -1) {
                elemExists = true
                templateExists = true
                elemMessage = 'This snippet has been used elsewhere'
              }
            }
            if (elementKeys != undefined && elementKeys.length > 0) {
              elementKeys = elementKeys.toLowerCase()
              var query2 = query.hotkeys.toLowerCase()
              if (elementKeys.search(query2) != -1) {
                //console.log(query)
                keyExists = true
                templateExists = true
                keyMessage = 'This key combination has been used elsewhere'
              }
            }
          }
        })
      }
  
      return {
        hotkeyMessage: keyMessage,
        snippetMessage: elemMessage,
        Exists: templateExists
      }
    }
  
    indexFromTemplates (query = false) {
      var templatesArray = this.templates.snippets
      var resultsArray = []
      var index = 0
      templatesArray.forEach(element => {
        var elementText = element.template
        if (query && elementText != undefined) {
          var elementText = elementText.toLowerCase()
          //query= query.toLowerCase()
          if (elementText.search(query.toLowerCase()) != -1) {
            resultsArray.push(index)
          }
        } else {
          resultsArray.push(index)
        }
        index++
      })
      //console.log(resultsArray.length)
      return resultsArray
    }
  
    templateIndex (object) {
      var retval
      var index = 0
      this.templates.snippets.forEach(snippet => {
        if (snippet.template == object.template) {
          retval = index
        }
        index++
      })
      return retval
    }
  
    templatesData () {
      var query = document.getElementById('templateSearch').value
      return this.searchTemplates(query)
    }
    loadDefault () {
      var index = 0
      this.defaultTemplates.forEach(template => {
        if (index == 0) {
          this.templates.set(0, template)
        } else {
          this.templates.push(template)
        }
        index++
      })
      this.saveTemplates()
    }
  }