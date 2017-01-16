const combine = require('depject')

const http = require('./')
const example = require('../example')

const combinedModules = combine({ example, http })

combinedModules.vas.start.map(start => start())
