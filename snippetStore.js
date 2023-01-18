class snippetStore {
    constructor () {
      if (!localStorage.templates) {
        localStorage.templates = '[]'
      }
      this.snippets = JSON.parse(localStorage.templates)
    }
    pushSnippet (snippet) {
      this.snippets.push()
      this.saveSnippets()
    }
    pop () {
      this.snippets.pop()
      this.saveSnippets()
    }
    unshift () {
      this.snippets.unshift()
      this.saveSnippets()
    }
    addSnippet (snippet) {
      this.snippets.push(snippet)
      this.saveSnippets()
    }
    removeSnippet (index) {
      this.snippets.splice(index, 1)
      this.saveSnippets()
    }
    editSnippet (index, snippet) {
      this.snippets[index] = snippet
      this.saveSnippets()
    }
    getSnippet (index) {
      return this.snippets[index]
    }
    saveSnippets () {
      localStorage.templates = JSON.stringify(this.snippets)
    }
  }