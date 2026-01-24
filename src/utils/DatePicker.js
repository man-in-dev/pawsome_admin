// import React, { useState } from 'react'

// import { TextField, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material'

// const CustomDatePicker = ({ label, value, onChange }) => {
//   const [hour, setHour] = useState('')
//   const [minute, setMinute] = useState('')
//   const [amPm, setAmPm] = useState('AM')

//   // Handle the change of time values
//   const handleHourChange = e => {
//     const newHour = e.target.value
//     setHour(newHour)
//     updateTime(newHour, minute, amPm)
//   }

//   const handleMinuteChange = e => {
//     const newMinute = e.target.value
//     setMinute(newMinute)
//     updateTime(hour, newMinute, amPm)
//   }

//   const handleAmPmChange = e => {
//     const newAmPm = e.target.value
//     setAmPm(newAmPm)
//     updateTime(hour, minute, newAmPm)
//   }

//   // Update the time state in the parent component
//   const updateTime = (hour, minute, amPm) => {
//     if (hour && minute) {
//       const formattedTime = `${hour}:${minute} ${amPm}`
//       onChange(formattedTime) // Send the formatted time to the parent
//     }
//   }

//   return (
//     <Box display='flex' gap={2} alignItems='center'>
//       {/* Date Picker */}

//       {/* Hour selection */}
//       <FormControl>
//         <InputLabel id='hour-label'></InputLabel>
//         <Select labelId='hour-label' value={hour} onChange={handleHourChange} displayEmpty>
//           <MenuItem value='' disabled>
//             Select Hour
//           </MenuItem>
//           {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
//             <MenuItem key={hour} value={hour}>
//               {hour}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       {/* Minute selection */}
//       <FormControl>
//         <InputLabel id='minute-label'></InputLabel>
//         <Select labelId='minute-label' value={minute} onChange={handleMinuteChange} displayEmpty>
//           <MenuItem value='' disabled>
//             Select Minute
//           </MenuItem>
//           {Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : i)).map(minute => (
//             <MenuItem key={minute} value={minute}>
//               {minute}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       {/* AM/PM selection */}
//       <FormControl>
//         <InputLabel id='am-pm-label'></InputLabel>
//         <Select labelId='am-pm-label' value={amPm} onChange={handleAmPmChange}>
//           <MenuItem value='AM'>AM</MenuItem>
//           <MenuItem value='PM'>PM</MenuItem>
//         </Select>
//       </FormControl>
//     </Box>
//   )
// }

// export default CustomDatePicker

// CustomDatePicker.jsx
import React, { useState, useEffect } from 'react'

import { Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material'

const CustomDatePicker = ({ label, value, onChange }) => {
  // If value is a Date, initialize state accordingly; otherwise, empty defaults.
  const initialHour = value instanceof Date ? value.getHours() % 12 || 12 : ''
  const initialMinute =
    value instanceof Date ? (value.getMinutes() < 10 ? `0${value.getMinutes()}` : value.getMinutes().toString()) : ''
  const initialAmPm = value instanceof Date ? (value.getHours() >= 12 ? 'PM' : 'AM') : 'AM'

  const [hour, setHour] = useState(initialHour)
  const [minute, setMinute] = useState(initialMinute)
  const [amPm, setAmPm] = useState(initialAmPm)

  // When the external value changes, update the local state.
  useEffect(() => {
    if (value instanceof Date) {
      const newHour = value.getHours() % 12 || 12
      const newMinute = value.getMinutes() < 10 ? `0${value.getMinutes()}` : value.getMinutes().toString()
      const newAmPm = value.getHours() >= 12 ? 'PM' : 'AM'
      setHour(newHour)
      setMinute(newMinute)
      setAmPm(newAmPm)
    }
  }, [value])

  // Update parent's onChange with a new Date constructed from our selections.
  const updateTime = (newHour, newMinute, newAmPm) => {
    if (newHour && newMinute) {
      let hour24 = parseInt(newHour, 10)
      if (newAmPm === 'PM' && hour24 < 12) hour24 += 12
      if (newAmPm === 'AM' && hour24 === 12) hour24 = 0
      const newDate = new Date()
      newDate.setHours(hour24, parseInt(newMinute, 10), 0, 0)
      onChange(newDate)
    }
  }

  const handleHourChange = e => {
    const newHour = e.target.value
    setHour(newHour)
    updateTime(newHour, minute, amPm)
  }

  const handleMinuteChange = e => {
    const newMinute = e.target.value
    setMinute(newMinute)
    updateTime(hour, newMinute, amPm)
  }

  const handleAmPmChange = e => {
    const newAmPm = e.target.value
    setAmPm(newAmPm)
    updateTime(hour, minute, newAmPm)
  }

  return (
    <Box display='flex' gap={3} alignItems='center'>
      {/* Hour Selection */}
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id='hour-label'>Hour</InputLabel>
        <Select
          sx={{ marginRight: '8' }}
          labelId='hour-label'
          value={hour}
          onChange={handleHourChange}
          label='Hour'
          displayEmpty
        >
          <MenuItem value='' disabled></MenuItem>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
            <MenuItem key={h} value={h}>
              {h}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Minute Selection */}
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id='minute-label'>Minute</InputLabel>
        <Select
          sx={{ marginRight: '8' }}
          labelId='minute-label'
          value={minute}
          onChange={handleMinuteChange}
          label='Minute'
          displayEmpty
        >
          <MenuItem value='' disabled></MenuItem>
          {Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : i)).map(min => (
            <MenuItem key={min} value={min}>
              {min}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* AM/PM Selection */}
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id='am-pm-label'>AM/PM</InputLabel>
        <Select sx={{ marginRight: '8' }} labelId='am-pm-label' value={amPm} onChange={handleAmPmChange} label='AM/PM'>
          <MenuItem value='AM'>AM</MenuItem>
          <MenuItem value='PM'>PM</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default CustomDatePicker
