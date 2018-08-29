
    /*---------------------------------------------------------------------------------------------------
    ~ SMOOTH SCROLLING WHEN CLICKING ON LINKS IN NAVBAR
    ---------------------------------------------------------------------------------------------------*/
    $(document).ready(function () {
        // Add smooth scrolling to all links in navbar + footer link
        $(".navbar a, footer a[href='#mpPrediction']").on('click', function (event) {

            // Make sure this.hash has a value before overriding default behavior
            if (this.hash !== "") {

                // Prevent default anchor click behavior
                event.preventDefault();

                // Store hash
                var hash = this.hash;

                // Using jQuery's animate() method to add smooth page scroll
                // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
                $('html, body').animate({
                    scrollTop: $(hash).offset().top
                }, 900, function () {

                    // Add hash (#) to URL when done scrolling (default click behavior)
                    window.location.hash = hash;
                });
            } // End if
        });
    });

    /*---------------------------------------------------------------------------------------------------
    ~ GETTER FOR VALUES FOR INFO SECTION
    ---------------------------------------------------------------------------------------------------*/
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    String.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    var notSuitable = params["individuals"] - allIndividuals.length;
    document.getElementById("individuals").innerHTML = params["individuals"];
    document.getElementById("species").innerHTML = params["species"].replaceAll('_', ' ').replaceAll(',', ', ');
    document.getElementById("db").innerHTML = params["db"];
    document.getElementById("out").innerHTML = params["out"];
    document.getElementById("minpath").innerHTML = params["minpath"];

    var htmlIndividuals = allIndividuals;
    document.getElementById("analyzedIndividuals").innerHTML = htmlIndividuals.toString().replaceAll(',', '<br style="margin-bottom: 5px">');
