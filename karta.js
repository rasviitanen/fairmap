//////////////////////////////////////
//             SKILLSETS            //
//////////////////////////////////////

//Skillsets are currently in the filter
var active_skillsets = [];
//List of all active exhibitors, multiple instances of its elements may occur due to overlap between skillsets.
//This is intended, for easy handling of filter deactivation
//(By only removoving one instance of all exhibitors in a skillset-list from the active list).
var active = [];

//Filter out the skillsets not pressed
//IMPORTANT: Uses OR-logic for the filtration
var clickOnSkillset = function() {
    //Get the name of the skill pressed (e.g. "Finance" or "Programming").
    var skill = this.textContent;

    //Check if the skillset is already active, then deactivate it.
    if (active_skillsets.includes(skill)) {
        //Deactivate
        active_skillsets = active_skillsets.filter(e => e !== skill);
        for (i = 0; i < skillset_dict[skill].length; i++){
            var index = active.indexOf(skillset_dict[skill][i]);
            if (index > -1){
                //Remove exactly ONE instance of an exhibitor from the active list.
                active.splice(index, 1);
            }
        }
    } else {
        //Else, we add the skillset to the active_skillset list, to allow filtration
        active_skillsets.push(skill);
    }

    //Handle the exhibitor list according to which skillsets are currently active
    ul = document.getElementById("exhibitor_names");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        var id = li[i].innerHTML.substr(0,li[i].textContent.indexOf(' '));
        if (active_skillsets.length == 0) {
            //If no skillsets are selected, view every exhibitor
            li[i].style.display = "";
        } else if (active_skillsets.includes(skill) && skillset_dict[skill].includes(id)) {
            li[i].style.display = "";
            active.push(id);
        } else if (!active.includes(id)) {
            li[i].style.display = "none";
        }
    }

    //!TODO Update the style if the button is pressed/not pressed
    if (this.style.backgroundColor === "rgb(42, 180, 201)"){
        this.style.backgroundColor = "white";
        this.style.color = "#818181";
    } else {
        this.style.backgroundColor = "rgb(42, 180, 201)";
    }
    //Lower opacity on map
    filterMap();
};

// Find monters in a filter on the map, set all other monters to an opacity of 0.4 to make it clearer to the viewer
var filterMap = function() {
    var montrar = document.getElementById("Montrar").childNodes;
    for (var i = 1; i < montrar.length; i += 2) {
        //Check which monters are active and which are not, and change their style accordingly
        if (active_skillsets.length == 0) {
            montrar[i].style.opacity = "1";
        }
        else if (active.includes(montrar[i].getElementsByTagName("g")[0].textContent.trim())) {
            montrar[i].style.opacity = "1";
        } else {
            montrar[i].style.opacity = "0.3";
        }
    }
};

//Add a clic-listener to all skillsets, for easy
function add_skillset_listener() {
    var skillsets = document.getElementById("skillset_list").childNodes;
    for (var i = 1; i < skillsets.length; i += 2) {
        skillsets[i].addEventListener('click', clickOnSkillset, false);
    }
};
add_skillset_listener();

//Size of svg, and a link to the map
var width = 1188,
    height = 735;
    svg_link = "interactive_map_2.svg";
    heart_link = "climate_heart.png";

//Add the map to the page, uses d3 (datadriven documents)
d3.xml(svg_link).mimeType("image/svg+xml").get(function(error, xml) {
    if (error) throw error;

    var svg_map = xml.documentElement;
    document.getElementById("interactive_map").appendChild(svg_map);

    //Set the map to fullscreen and add the zoom-functionality
    var svg = d3.select("svg")
              .attr("width", "100%")
              .attr("height", "100%")
              .call(zoom)
    ;

    //Parse all groups included in the "Montrar" group.
    var montrar = document.getElementById("Montrar").childNodes;
    for (var i = 1; i < montrar.length; i += 2) {
        //Add hover functionality to the subgroups, to display tooltips, see called functions.
        montrar[i].addEventListener('mouseover', hoverOnMonter, false);
        montrar[i].addEventListener('mouseout', exitMonter, false);

        //Populate the exhibitor list with <li>-tags, to get a list of all exhibitors
        var node = document.createElement("LI");

        //Add the ID to the begining, e.g ("C02" or "K132")
        node.textContent = montrar[i].getElementsByTagName("g")[0].textContent.trim() + " ";

        //Lookup which ID corresponds to which exhibitor, stored in separate file.
        var exhibitor_name = document.createTextNode(exhibitor_dict[montrar[i].getElementsByTagName("g")[0].textContent.trim()] + " ");
        node.appendChild(exhibitor_name);

        //Add the climate-heart to the end of the name, list of each exhibitors that climate compensates
        //are to be found in a different file
        if (climate_compensates.includes(montrar[i].getElementsByTagName("g")[0].textContent.trim())) {
            var node_image = document.createElement("IMG");
            node_image.setAttribute("src", heart_link);
            node_image.setAttribute("height", "16px");
            node.appendChild(node_image);
        }

        //If we press on an exhibitor in the list, we want to close the exhibitor list
        node.setAttribute("onclick", "closeNav()");

        //Find the spot on the image
        node.addEventListener('click', findOnMap, false);

        //Finally, add the exhibitor name to the DOM
        document.getElementById("exhibitor_names").appendChild(node);
    }
});

//////////////////////////////////////
//    ZOOM FUNCTIONS FOR THE MAP    //
//////////////////////////////////////
var zoom = d3.zoom()
    .on("zoom", zoomed);
function zoomed() {
    d3.select("#zoomable").attr("transform", d3.event.transform);
  }

//Move and scale the map to the position (x,y)
function scale_fn(x, y) {
    //Number of times to scale (magnify) the map
    var scale_number = 3;
    var transform = d3.zoomIdentity //<-- Transforms the coordinates when you press on an exhibitor in the list (both pans and zooms)
    .translate((-x*3+ width/2), (-y*3 + height/2))
    .scale(scale_number);
    d3.select("svg").transition() //<-- Sick animation, >750 ms is prefered, for smooth transition
        .duration(750)
        .call(zoom.transform, transform);
}

//Resets the map to the inital state (zoom and pan)
function scale_reset() {
    var transform = d3.zoomIdentity //<-- Transforms the coordinates when you press on an exhibitor in the list (both pans and zooms)
    .translate(0,0)
    .scale(1);
    d3.select("svg").transition() //<-- Sick animation, >750 ms is prefered, for smooth transition
        .duration(750)
        .call(zoom.transform, transform);
    var montrar = document.getElementById("Montrar").childNodes;
    for (var i = 1; i < montrar.length; i += 2) {
        montrar[i].style.opacity = "1";
    }
}

// Find a monter on the map, use scale_fn to jump to it on the map
// Style changes: Set all other monters to an opacity of 0.4 to make it clearer to the viewer
var findOnMap = function() {
    var exhibitor_index = this.textContent.substr(0, this.textContent.indexOf(' '));
    var montrar = document.getElementById("Montrar").childNodes;
    for (var i = 1; i < montrar.length; i += 2) {
        if (montrar[i].getElementsByTagName("g")[0].textContent.trim() === exhibitor_index) {
            montrar[i].style.opacity = "1";
            scale_fn(montrar[i].getElementsByTagName("rect")[0].getAttribute("x"),
                montrar[i].getElementsByTagName("rect")[0].getAttribute("y"));
        } else {
            montrar[i].style.opacity = "0.3";
        }
    }
};


//////////////////////////////////////
//              TOOLTIPS            //
//////////////////////////////////////

//Move the tooltip to the position of the mouse, and offset it some
window.onmousemove = function (e) {
    var x = e.clientX,
        y = e.clientY;
    document.getElementById("tooltip").style.top = (y - 20) + 'px';
    document.getElementById("tooltip").style.left = (x + 4) + 'px';
};

var hoverOnMonter = function() {
    var text = exhibitor_dict[this.getElementsByTagName("g")[0].textContent.trim()];
    document.getElementById("tooltip").textContent = text;
    document.getElementById("tooltip").style.display = "block";
};
//!TODO could probalby be improoved
var exitMonter = function() {
    document.getElementById("tooltip").style.display = "none";
};

//The search filter that is applied in the exhibitor list.
function filter_exhibitors() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("exhibitor_input");
    filter = input.value.toUpperCase();
    ul = document.getElementById("exhibitor_names");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        if (li[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

//Side navigation, list of exhibitors
function openNav() {
    document.getElementById("exhibitor_list").style.width = "250px";
}
function closeNav() {
    document.getElementById("exhibitor_list").style.width = "0";
}
