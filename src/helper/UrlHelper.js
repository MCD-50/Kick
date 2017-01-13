import React, { Component } from 'react';

import { getMethodString, getResourcesString } from './AppConstant.js';

export function getFullUrl(data, isMethod) {
    //if (isMethod)
    return getMethodString(data);
    //return getResourcesString(data);
}