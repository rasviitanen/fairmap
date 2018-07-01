# fairmap
Fairmap is an interactive map using SVG togheter with D3 for zoom and pan control.

Preview available at https://rasviitanen.github.io/fairmap/karta.html

### To create your own map simply:
Put all interactive graphics in a layer called "Montrar", if using Adobe Illustrator (Or in a <g id="Montrar"> if using pure SVG). To enable interaction, each entity needs to be identified with a label in the form of a text element (by using the type tool in Adobe Illustrator, the text you write will be the label), this label is then used to map the interactive elements together.
  
For example:
  1. Create a layer or group in Adobe Illustrator called "Montrar".
  2. Select the type tool (t), and write `My Unique Label`, make sure belongs to "Montrar".
  3. In exhibitor_data.js, put the following: `exhibitor_dict["My Unique Label"] = "Test Company";`

Now the object tied to `My Unique Label` will be interacitve, i.e. selectable from the list and hoverable.

To style the object, simply put it in a group and add new elements to the group, these will also be interactive. 
For example:
```
<g id="Montrar">
  <g id="XMLID_2434_">
    <text id="XMLID_1000_" transform="matrix(1 0 0 1 138.687 360.322)" class="st7 st5 st8">C03</text>
    <rect id="XMLID_999_" x="138.7" y="352.4" class="st9" width="15.8" height="9.8"/>
  </g>
</g>
```

To add special filters (such as skillsets) simply put this in `exhibitor_data.js`:

```skillset_dict["My Skillset 1"] = ["My Unique Label 1", "My Unique Label 2"]```

and a special symbol by the names by adding the following to the same file.

`var climate_compensates = ["My Unique Label"]`
