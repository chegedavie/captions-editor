class LocalCaptions {
  constructor (storeName) {
    localStorage.getItem(storeName)
      ? (this.regionsData = JSON.parse(localStorage.getItem(storeName)))
      : (this.regionsData = [])
    this.storeName = storeName
    this.error = ''
  }

  getRegion(index){
    return this.regionsData[index]
  }

  addRegion (region) {
    try {
      if (typeof region == 'object') {
        if (this.isDuplicate(region)) return
        this.regionsData.push(region)
        this.syncRegions()
      } else {
        throw new TypeError('region must be an object')
      }
    } catch (error) {
      console.error(error)
      this.error = error
    }
  }

  addRegions (...regions) {
    try {
      if (regions.forEach) {
        regions.forEach(region => {
          if (typeof region != 'object')
            throw new TypeError('region must be of type object')
          if (!this.isDuplicate(region)) this.regionsData.push(region)
        })
        this.syncRegions()
      } else {
        throw new TypeError('regions must be of type array')
      }
    } catch (error) {
      console.error(error)
      this.error = error
    }
  }

  seedRegions (regions) {
    //console.log(regions,' at seedRegions')
    try {
      if (!regions.forEach)
        throw new TypeError(
          'regions must be of type Array.\n',
          typeof regions,
          'provided'
        )
      regions.forEach((region, index) => {
        if (this.isDuplicate(region)) return
        if(this.search(region.start)) throw new Error('timestamp '+region.start+' has been used elsewhere!')
        if(this.search(region.end)) throw new Error('timestamp '+region.end+' has been used elsewhere!')
        if(!this.validRegion(region))throw new TypeError(JSON.stringify(region)+' is not a valid region')
      })
      this.regionsData = regions
      localStorage.setItem(this.storeName, JSON.stringify(regions))
      return regions
    } catch (error) {
      console.error(error)
      this.error = error
    }
  }

  insertRegion (regionId, region) {
    var index = Number(regionId - 1)
    try {
      if (typeof regionId != 'number')
        throw new TypeError('region id must be an integer.')
      if (!this.validRegion(region))
        throw new TypeError(JSON.stringify(region) + 'is an invalid region!')
      if (this.isDuplicate(region))
        throw new EvalError('This region already exists!')
      var beforePos = this.regionsData.slice(0, index)
      var afterPos = this.regionsData.slice(index)
      var tempArray = beforePos.concat(region, afterPos)
      this.regionsData = tempArray
      this.syncRegions()
    } catch (error) {
      console.error(error)
      this.error = error
    }
  }

  updateRegion (regionId, region) {
    if (this.isDuplicate(region)) return
    if (!this.validRegion(region))
      throw new TypeError(JSON.stringify(region) + ' is not a valid region')
    this.regionsData[regionId - 1] = region
    this.syncRegions()
  }

  deleteRegion (regionId) {
    try {
      if (typeof regionId == 'number') {
        var reg = this.regionsData[regionId]
        //console.log(reg)
        if (!this.regionsData[regionId])
          throw new RangeError('Region does not exist')
        var beforePos = this.regionsData.slice(0, regionId)
        var afterPos = this.regionsData.slice(regionId + 1)
        this.regionsData = beforePos.concat(afterPos)
        this.syncRegions()
        return reg.regionId
      } else {
        throw new TypeError(
          'region id must be an integer. Your input is a ' + typeof regionId
        )
      }
    } catch (error) {
      console.error(error)
      this.error = error
    }
  }
  deleteRegions (...regionIds) {
    var deleted=[]
    regionIds.forEach(regionId => {
      deleted.push(this.deleteRegion(regionId))
    })
    return deleted
  }

  isDuplicate (region) {
    var searchString = JSON.stringify(this.regionsData)
    var regionString = JSON.stringify(region)
    return searchString.includes(regionString)
  }

  search (term, string = false) {
    let searchString
    let hayStack
    typeof term != 'string'
      ? typeof JSON.stringify(term) == 'string'
        ? searchString = JSON.stringify(term)
        : false
      : searchString = term
    string ? hayStack= string: hayStack=JSON.stringify(this.regionsData)
    //console.log(hayStack)
    return hayStack.includes(searchString)
  }

  validRegion (region) {
    if (
      !region.hasOwnProperty('start') |
      !region.hasOwnProperty('end') |
      !region.hasOwnProperty('data')
    ) {
      return false
    }
    return true
  }

  regionSibling (reg, regs = this.regionsData) {
    var regionsBefore = regs.filter(item => {
      return Number(item.start) < Number(reg.start)
    })

    return regionsBefore[regionsBefore.length - 1]
  }

  syncLineNumbers () {
    var syncedRegions = []
    this.regionsData.forEach((region, index) => {
      if (region.data) {
        region.data.lineNumber = index + 1
      } else {
        region.data = { note: '', lineNumber }
        region.data.lineNumber = index + 1
      }
      syncedRegions.push(region)
    })
    //console.warn(syncedRegions)
    return syncedRegions
  }
  syncRegions () {
    var store = this.storeName
    var synced = this.syncLineNumbers()
    this.regionsData = synced
    localStorage.setItem(store, JSON.stringify(synced))
  }

  async emptyRegions(){
    this.regionsData=[]
    this.syncRegions()
    if(this.regionsData==[]){
      return true
    }
  }
}
