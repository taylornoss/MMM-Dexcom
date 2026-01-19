# MMM-Dexcom
Magic Mirror module for Dexcom G7 Readings

Sample Config
```json
{
    "module": "MMM-Dexcom",
    "position": "top_left",
    "config": {
        "updateSecs": 300, // Default is refresh every 5 minutes
        "username": "",  // Set to your Dexcom username
        "password": "", // Password for your Dexcom account
        "units": "mg",  // or mmol
        "lowlimit": 70,  // must be relevant to the units
        "highlimit": 200,  // must be relevant to the units
    }
}
```
