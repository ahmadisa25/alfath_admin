import React from 'react'

export const NumberFormat = (value) => 
new Intl.NumberFormat('id-ID').format(value);