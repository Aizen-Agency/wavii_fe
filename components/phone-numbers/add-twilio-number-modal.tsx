"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDispatch, useSelector } from "react-redux"
import { fetchAvailableNumbers, registerToTrunk } from "@/store/phoneNumberSlice"
import { AppDispatch, RootState } from "@/store/store"
import LoadingOverlay from "@/components/loadingOverlay"
import { toast } from "react-toastify"

interface AddTwilioNumberModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const countryOptions = [
  { code: 'ad', label: 'Andorra' },
  { code: 'ae', label: 'United Arab Emirates' },
  { code: 'af', label: 'Afghanistan' },
  { code: 'ag', label: 'Antigua and Barbuda' },
  { code: 'ai', label: 'Anguilla' },
  { code: 'al', label: 'Albania' },
  { code: 'am', label: 'Armenia' },
  { code: 'ao', label: 'Angola' },
  { code: 'aq', label: 'Antarctica' },
  { code: 'ar', label: 'Argentina' },
  { code: 'as', label: 'American Samoa' },
  { code: 'at', label: 'Austria' },
  { code: 'au', label: 'Australia' },
  { code: 'aw', label: 'Aruba' },
  { code: 'ax', label: 'Åland Islands' },
  { code: 'az', label: 'Azerbaijan' },
  { code: 'ba', label: 'Bosnia and Herzegovina' },
  { code: 'bb', label: 'Barbados' },
  { code: 'bd', label: 'Bangladesh' },
  { code: 'be', label: 'Belgium' },
  { code: 'bf', label: 'Burkina Faso' },
  { code: 'bg', label: 'Bulgaria' },
  { code: 'bh', label: 'Bahrain' },
  { code: 'bi', label: 'Burundi' },
  { code: 'bj', label: 'Benin' },
  { code: 'bl', label: 'Saint Barthélemy' },
  { code: 'bm', label: 'Bermuda' },
  { code: 'bn', label: 'Brunei Darussalam' },
  { code: 'bo', label: 'Bolivia, Plurinational State of' },
  { code: 'bq', label: 'Bonaire, Sint Eustatius and Saba' },
  { code: 'br', label: 'Brazil' },
  { code: 'bs', label: 'Bahamas' },
  { code: 'bt', label: 'Bhutan' },
  { code: 'bv', label: 'Bouvet Island' },
  { code: 'bw', label: 'Botswana' },
  { code: 'by', label: 'Belarus' },
  { code: 'bz', label: 'Belize' },
  { code: 'ca', label: 'Canada' },
  { code: 'cc', label: 'Cocos (Keeling) Islands' },
  { code: 'cd', label: 'Congo, Democratic Republic of the' },
  { code: 'cf', label: 'Central African Republic' },
  { code: 'cg', label: 'Congo' },
  { code: 'ch', label: 'Switzerland' },
  { code: 'ci', label: 'Côte d\'Ivoire' },
  { code: 'ck', label: 'Cook Islands' },
  { code: 'cl', label: 'Chile' },
  { code: 'cm', label: 'Cameroon' },
  { code: 'cn', label: 'China' },
  { code: 'co', label: 'Colombia' },
  { code: 'cr', label: 'Costa Rica' },
  { code: 'cu', label: 'Cuba' },
  { code: 'cv', label: 'Cabo Verde' },
  { code: 'cw', label: 'Curaçao' },
  { code: 'cx', label: 'Christmas Island' },
  { code: 'cy', label: 'Cyprus' },
  { code: 'cz', label: 'Czechia' },
  { code: 'de', label: 'Germany' },
  { code: 'dj', label: 'Djibouti' },
  { code: 'dk', label: 'Denmark' },
  { code: 'dm', label: 'Dominica' },
  { code: 'do', label: 'Dominican Republic' },
  { code: 'dz', label: 'Algeria' },
  { code: 'ec', label: 'Ecuador' },
  { code: 'ee', label: 'Estonia' },
  { code: 'eg', label: 'Egypt' },
  { code: 'eh', label: 'Western Sahara' },
  { code: 'er', label: 'Eritrea' },
  { code: 'es', label: 'Spain' },
  { code: 'et', label: 'Ethiopia' },
  { code: 'fi', label: 'Finland' },
  { code: 'fj', label: 'Fiji' },
  { code: 'fk', label: 'Falkland Islands (Malvinas)' },
  { code: 'fm', label: 'Micronesia, Federated States of' },
  { code: 'fo', label: 'Faroe Islands' },
  { code: 'fr', label: 'France' },
  { code: 'ga', label: 'Gabon' },
  { code: 'gb', label: 'United Kingdom of Great Britain and Northern Ireland' },
  { code: 'gd', label: 'Grenada' },
  { code: 'ge', label: 'Georgia' },
  { code: 'gf', label: 'French Guiana' },
  { code: 'gg', label: 'Guernsey' },
  { code: 'gh', label: 'Ghana' },
  { code: 'gi', label: 'Gibraltar' },
  { code: 'gl', label: 'Greenland' },
  { code: 'gm', label: 'Gambia' },
  { code: 'gn', label: 'Guinea' },
  { code: 'gp', label: 'Guadeloupe' },
  { code: 'gq', label: 'Equatorial Guinea' },
  { code: 'gr', label: 'Greece' },
  { code: 'gs', label: 'South Georgia and the South Sandwich Islands' },
  { code: 'gt', label: 'Guatemala' },
  { code: 'gu', label: 'Guam' },
  { code: 'gw', label: 'Guinea-Bissau' },
  { code: 'gy', label: 'Guyana' },
  { code: 'hk', label: 'Hong Kong' },
  { code: 'hm', label: 'Heard Island and McDonald Islands' },
  { code: 'hn', label: 'Honduras' },
  { code: 'hr', label: 'Croatia' },
  { code: 'ht', label: 'Haiti' },
  { code: 'hu', label: 'Hungary' },
  { code: 'id', label: 'Indonesia' },
  { code: 'ie', label: 'Ireland' },
  { code: 'il', label: 'Israel' },
  { code: 'im', label: 'Isle of Man' },
  { code: 'in', label: 'India' },
  { code: 'io', label: 'British Indian Ocean Territory' },
  { code: 'iq', label: 'Iraq' },
  { code: 'ir', label: 'Iran, Islamic Republic of' },
  { code: 'is', label: 'Iceland' },
  { code: 'it', label: 'Italy' },
  { code: 'je', label: 'Jersey' },
  { code: 'jm', label: 'Jamaica' },
  { code: 'jo', label: 'Jordan' },
  { code: 'jp', label: 'Japan' },
  { code: 'ke', label: 'Kenya' },
  { code: 'kg', label: 'Kyrgyzstan' },
  { code: 'kh', label: 'Cambodia' },
  { code: 'ki', label: 'Kiribati' },
  { code: 'km', label: 'Comoros' },
  { code: 'kn', label: 'Saint Kitts and Nevis' },
  { code: 'kp', label: 'Korea, Democratic People\'s Republic of' },
  { code: 'kr', label: 'Korea, Republic of' },
  { code: 'kw', label: 'Kuwait' },
  { code: 'ky', label: 'Cayman Islands' },
  { code: 'kz', label: 'Kazakhstan' },
  { code: 'la', label: 'Lao People\'s Democratic Republic' },
  { code: 'lb', label: 'Lebanon' },
  { code: 'lc', label: 'Saint Lucia' },
  { code: 'li', label: 'Liechtenstein' },
  { code: 'lk', label: 'Sri Lanka' },
  { code: 'lr', label: 'Liberia' },
  { code: 'ls', label: 'Lesotho' },
  { code: 'lt', label: 'Lithuania' },
  { code: 'lu', label: 'Luxembourg' },
  { code: 'lv', label: 'Latvia' },
  { code: 'ly', label: 'Libya' },
  { code: 'ma', label: 'Morocco' },
  { code: 'mc', label: 'Monaco' },
  { code: 'md', label: 'Moldova, Republic of' },
  { code: 'me', label: 'Montenegro' },
  { code: 'mf', label: 'Saint Martin (French part)' },
  { code: 'mg', label: 'Madagascar' },
  { code: 'mh', label: 'Marshall Islands' },
  { code: 'mk', label: 'North Macedonia' },
  { code: 'ml', label: 'Mali' },
  { code: 'mm', label: 'Myanmar' },
  { code: 'mn', label: 'Mongolia' },
  { code: 'mo', label: 'Macao' },
  { code: 'mp', label: 'Northern Mariana Islands' },
  { code: 'mq', label: 'Martinique' },
  { code: 'mr', label: 'Mauritania' },
  { code: 'ms', label: 'Montserrat' },
  { code: 'mt', label: 'Malta' },
  { code: 'mu', label: 'Mauritius' },
  { code: 'mv', label: 'Maldives' },
  { code: 'mw', label: 'Malawi' },
  { code: 'mx', label: 'Mexico' },
  { code: 'my', label: 'Malaysia' },
  { code: 'mz', label: 'Mozambique' },
  { code: 'na', label: 'Namibia' },
  { code: 'nc', label: 'New Caledonia' },
  { code: 'ne', label: 'Niger' },
  { code: 'nf', label: 'Norfolk Island' },
  { code: 'ng', label: 'Nigeria' },
  { code: 'ni', label: 'Nicaragua' },
  { code: 'nl', label: 'Netherlands, Kingdom of the' },
  { code: 'no', label: 'Norway' },
  { code: 'np', label: 'Nepal' },
  { code: 'nr', label: 'Nauru' },
  { code: 'nu', label: 'Niue' },
  { code: 'nz', label: 'New Zealand' },
  { code: 'om', label: 'Oman' },
  { code: 'pa', label: 'Panama' },
  { code: 'pe', label: 'Peru' },
  { code: 'pf', label: 'French Polynesia' },
  { code: 'pg', label: 'Papua New Guinea' },
  { code: 'ph', label: 'Philippines' },
  { code: 'pk', label: 'Pakistan' },
  { code: 'pl', label: 'Poland' },
  { code: 'pm', label: 'Saint Pierre and Miquelon' },
  { code: 'pn', label: 'Pitcairn' },
  { code: 'pr', label: 'Puerto Rico' },
  { code: 'ps', label: 'Palestine, State of' },
  { code: 'pt', label: 'Portugal' },
  { code: 'pw', label: 'Palau' },
  { code: 'py', label: 'Paraguay' },
  { code: 'qa', label: 'Qatar' },
  { code: 're', label: 'Réunion' },
  { code: 'ro', label: 'Romania' },
  { code: 'rs', label: 'Serbia' },
  { code: 'ru', label: 'Russian Federation' },
  { code: 'rw', label: 'Rwanda' },
  { code: 'sa', label: 'Saudi Arabia' },
  { code: 'sb', label: 'Solomon Islands' },
  { code: 'sc', label: 'Seychelles' },
  { code: 'sd', label: 'Sudan' },
  { code: 'se', label: 'Sweden' },
  { code: 'sg', label: 'Singapore' },
  { code: 'sh', label: 'Saint Helena, Ascension and Tristan da Cunha' },
  { code: 'si', label: 'Slovenia' },
  { code: 'sj', label: 'Svalbard and Jan Mayen' },
  { code: 'sk', label: 'Slovakia' },
  { code: 'sl', label: 'Sierra Leone' },
  { code: 'sm', label: 'San Marino' },
  { code: 'sn', label: 'Senegal' },
  { code: 'so', label: 'Somalia' },
  { code: 'sr', label: 'Suriname' },
  { code: 'ss', label: 'South Sudan' },
  { code: 'st', label: 'Sao Tome and Principe' },
  { code: 'sv', label: 'El Salvador' },
  { code: 'sx', label: 'Sint Maarten (Dutch part)' },
  { code: 'sy', label: 'Syrian Arab Republic' },
  { code: 'sz', label: 'Eswatini' },
  { code: 'tc', label: 'Turks and Caicos Islands' },
  { code: 'td', label: 'Chad' },
  { code: 'tf', label: 'French Southern Territories' },
  { code: 'tg', label: 'Togo' },
  { code: 'th', label: 'Thailand' },
  { code: 'tj', label: 'Tajikistan' },
  { code: 'tk', label: 'Tokelau' },
  { code: 'tl', label: 'Timor-Leste' },
  { code: 'tm', label: 'Turkmenistan' },
  { code: 'tn', label: 'Tunisia' },
  { code: 'to', label: 'Tonga' },
  { code: 'tr', label: 'Türkiye' },
  { code: 'tt', label: 'Trinidad and Tobago' },
  { code: 'tv', label: 'Tuvalu' },
  { code: 'tw', label: 'Taiwan, Province of China' },
  { code: 'tz', label: 'Tanzania, United Republic of' },
  { code: 'ua', label: 'Ukraine' },
  { code: 'ug', label: 'Uganda' },
  { code: 'um', label: 'United States Minor Outlying Islands' },
  { code: 'us', label: 'United States of America' },
  { code: 'uy', label: 'Uruguay' },
  { code: 'uz', label: 'Uzbekistan' },
  { code: 'va', label: 'Holy See' },
  { code: 'vc', label: 'Saint Vincent and the Grenadines' },
  { code: 've', label: 'Venezuela, Bolivarian Republic of' },
  { code: 'vg', label: 'Virgin Islands (British)' },
  { code: 'vi', label: 'Virgin Islands (U.S.)' },
  { code: 'vn', label: 'Viet Nam' },
  { code: 'vu', label: 'Vanuatu' },
  { code: 'wf', label: 'Wallis and Futuna' },
  { code: 'ws', label: 'Samoa' },
  { code: 'ye', label: 'Yemen' },
  { code: 'yt', label: 'Mayotte' },
  { code: 'za', label: 'South Africa' },
  { code: 'zm', label: 'Zambia' },
  { code: 'zw', label: 'Zimbabwe' }
]

export function AddTwilioNumberModal({ open, onClose, onSuccess }: AddTwilioNumberModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { availableNumbers, status } = useSelector((state: RootState) => state.phoneNumbers)
  const [selectedNumber, setSelectedNumber] = useState("")
  const [accountSid, setAccountSid] = useState("")
  const [authToken, setAuthToken] = useState("")
  const [countryCode, setCountryCode] = useState("")

  const handleFetchNumbers = async () => {
    try {
      await dispatch(fetchAvailableNumbers({ accountSid, authToken, countryCode })).unwrap()
      toast.success("Successfully fetched available numbers")
    } catch (error) {
      toast.error("Failed to fetch numbers: " + (error as Error).message)
    }
  }

  const handleActivateNumber = async () => {
    if (selectedNumber) {
      try {
        await dispatch(registerToTrunk({ phonesid: selectedNumber, accountSid, authToken })).unwrap()
        toast.success("Successfully activated number")
        onSuccess?.()
        onClose()
      } catch (error) {
        console.log(error)
        toast.error("Failed to activate number")
      }
    }
  }

  console.log(availableNumbers)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        {status === "loading" && <LoadingOverlay />}
        <DialogHeader>
          <DialogTitle>Add Twilio Number</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="account-sid">Account SID</Label>
            <Input id="account-sid" placeholder="Enter your Twilio Account SID" onChange={(e) => setAccountSid(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="auth-token">Auth Token</Label>
            <Input id="auth-token" type="password" placeholder="Enter your Twilio Auth Token" onChange={(e) => setAuthToken(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country-code">Country</Label>
            <select id="country-code" onChange={(e) => setCountryCode(e.target.value)} value={countryCode}>
              <option value="">Select a country</option>
              {countryOptions.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
          {/* <div className="grid gap-2">
            <Label htmlFor="twilio-number">Twilio Phone Number</Label>
            <Input id="twilio-number" placeholder="+1 (555) 000-0000" type="tel" />
          </div> */}
          <Button onClick={handleFetchNumbers}>Get Available Numbers</Button>
          <select onChange={(e) => {
            setSelectedNumber(e.target.value);
            console.log(`Selected number: ${e.target.value}`);
          }} value={selectedNumber}>
            <option value="">Select a number</option>
            {availableNumbers.map((number) => (
              <option key={number.phone_number_sid || number.phone_number} value={number.phone_number_sid || number.phone_number}>
                {number.friendly_name}
              </option>
            ))}
          </select>
          <Button onClick={handleActivateNumber}>Activate Number</Button>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {/* <Button className="bg-purple-600 hover:bg-purple-700">Add Twilio Number</Button> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}

