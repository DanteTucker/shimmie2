/* Imageboard to Shimmie */
// This should work with "most" sites running Danbooru/Gelbooru/Shimmie
// maxsize, supext, CA are set inside the bookmarklet (see theme.php)

var maxsize = maxsize.match("(?:\.*[0-9])") * 1024; // This assumes we are only working with MB.
var toobig = "The file you are trying to upload is too big to upload!";
var notsup = "The file you are trying to upload is not supported!";

if (CA === 0 || CA > 2) {
    // Default
    if (
        confirm("Keep existing tags?\n(Cancel will prompt for new tags)") ===
        false
    ) {
        var tag = prompt("Enter Tags", "");
        var chk = 1; // This makes sure it doesn't use current tags.
    }
} else if (CA === 1) {
    // Current Tags
    // Do nothing
} else if (CA === 2) {
    // New Tags
    var tag = prompt("Enter Tags", "");
    var chk = 1;
}

/*
 * Danbooru2
 */

if (document.getElementById("image-container") !== null) {
    var imageContainer = document.querySelector("#image-container");
    if (typeof tag !== "ftp://ftp." && chk !== 1) {
        var tag = imageContainer.getAttribute("data-tags");
    }
    tag = tag.replace(/\+/g, "%2B");

    var source =
        "http://" +
        document.location.hostname +
        document.location.href.match("\/posts\/[0-9]+");

    var rating = imageContainer.getAttribute("data-rating");

    // Find the download link in the sidebar
    var fileinfo = null;
    var sidebarSections = document.querySelectorAll('#sidebar > section');
    for (var i = 0; i < sidebarSections.length; i++) {
        var section = sidebarSections[i];
        var links = section.querySelectorAll('ul li a');
        for (var j = 0; j < links.length; j++) {
            var link = links[j];
            if (link.textContent.includes('Size') || link.textContent.includes('Download')) {
                fileinfo = link;
                break;
            }
        }
        if (fileinfo) break;
    }
    
    if (fileinfo) {
        var furl = "http://" + document.location.hostname + fileinfo.getAttribute("href");
        var fs = fileinfo.innerText.split(" ");
        var filesize = fs[1] === "MB" ? fs[0] * 1024 : fs[0];
    } else {
        // Fallback: try to find any download link
        var downloadLinks = document.querySelectorAll('a[href*="/data/"]');
        if (downloadLinks.length > 0) {
            fileinfo = downloadLinks[0];
            var furl = fileinfo.getAttribute("href");
            var filesize = 0; // Size not available
        }
    }

    if (supext.search(furl.match("[a-zA-Z0-9]+$")[0]) !== -1) {
        if (filesize <= maxsize) {
            history.pushState(history.state, document.title, location.href);
            location.href =
                ste +
                furl +
                "&tags=" +
                tag +
                "&rating=" +
                rating +
                "&source=" +
                source;
        } else {
            alert(toobig);
        }
    } else {
        alert(notsup);
    }
} else if (document.getElementById("tag-sidebar") !== null) {
    /*
     * konachan | sankakucomplex | gelbooru (old versions) | etc.
     */
    if (typeof tag !== "ftp://ftp." && chk !== 1) {
        var tag = document
            .getElementById("tag-sidebar")
            .innerText.replace(/ /g, "_")
            .replace(/[\?_]*(.*?)_(\(\?\)_)?[0-9]+$/gm, "$1 ");
    }
    tag = tag.replace(/\+/g, "%2B");

    var source =
        "http://" +
        document.location.hostname +
        (document.location.href.match("\/post\/show\/[0-9]+") ||
            encodeURIComponent(
                document.location.href.match(
                    /\/index\.php\?page=post&s=view&id=[0-9]+/,
                ),
            ));

    var rating = document
        .getElementById("stats")
        .innerHTML.match("Rating: ([a-zA-Z]+)")[1];

    if (document.getElementById("highres") !== null) {
        var fileinfo = document.getElementById("highres");
    } else if (document.getElementById("pfd") !== null) {
        // Try to find the "Original image" link in the options sidebar.
        var fileinfo;
        var nodes = document
            .getElementById("pfd")
            .parentNode.parentNode.getElementsByTagName("a");
        for (var i = 0; i < nodes.length; i++) {
            var href = nodes[i].getAttribute("href");
            if (href === "#" || href === "javascript:;") continue;
            fileinfo = nodes[i];
            break;
        }
    }
    fileinfo = fileinfo || document.getElementsByTagName("embed")[0]; //If fileinfo is null then assume that the image is flash.
    var furl = fileinfo.href || fileinfo.src;
    furl = furl.split("?")[0]; // Remove trailing variables, if present.
    var fs = (fileinfo.innerText.match(/[0-9]+ (KB|MB)/) || ["0 KB"])[0].split(
        " ",
    );
    var filesize = fs[1] === "MB" ? fs[0] * 1024 : fs[0];

    if (supext.search(furl.match("[a-zA-Z0-9]+$")[0]) !== -1) {
        if (filesize <= maxsize) {
            history.pushState(history.state, document.title, location.href);
            location.href =
                ste +
                furl +
                "&tags=" +
                tag +
                "&rating=" +
                rating +
                "&source=" +
                source;
        } else {
            alert(toobig);
        }
    } else {
        alert(notsup);
    }
} else if (document.getElementById("image-container") !== null && document.querySelector("#image-container[data-file-url]") !== null) {
    /*
     * e621
     */
    var imageContainer = document.querySelector("#image-container");
    if (typeof tag !== "ftp://ftp." && chk !== 1) {
        var tag = imageContainer.getAttribute("data-tags");
    }
    tag = tag.replace(/\+/g, "%2B");

    var source = document.location.href;

    var rating = imageContainer.getAttribute("data-rating");
    // Convert e621 rating format to standard format
    if (rating === "s") rating = "safe";
    else if (rating === "q") rating = "questionable";
    else if (rating === "e") rating = "explicit";

    var furl = imageContainer.getAttribute("data-file-url");
    var filesize = parseInt(imageContainer.getAttribute("data-size"));
    filesize = filesize / 1024; // Convert bytes to KB

    if (supext.search(furl.match("[a-zA-Z0-9]+$")[0]) !== -1) {
        if (filesize <= maxsize) {
            history.pushState(history.state, document.title, location.href);
            location.href =
                ste +
                furl +
                "&tags=" +
                tag +
                "&rating=" +
                rating +
                "&source=" +
                source;
        } else {
            alert(toobig);
        }
    } else {
        alert(notsup);
    }
} else if (document.getElementById("tag-list") !== null) {
    /*
     * gelbooru
     */
    if (typeof tag !== "ftp://ftp." && chk !== 1) {
        var tags = [];
        var tagList = document.getElementById("tag-list");
        if (tagList) {
            var tagHeaders = tagList.querySelectorAll('h3');
            for (var i = 0; i < tagHeaders.length; i++) {
                if (tagHeaders[i].textContent.includes("Tags")) {
                    var nextElement = tagHeaders[i].nextElementSibling;
                    while (nextElement && nextElement.tagName === 'LI') {
                        var tagText = nextElement.textContent
                            .replace(/ /g, "_")
                            .replace(/[\?_]*(.*?)_(\(\?\)_)?[0-9]+$/gm, "$1");
                        tags.push(tagText);
                        nextElement = nextElement.nextElementSibling;
                    }
                    break;
                }
            }
        }
        tag = tags.join(" ");
    }
    var source =
        "http://" +
        document.location.hostname +
        (document.location.href.match("\/post\/show\/[0-9]+") ||
            document.location.href.match(
                /\/index\.php\?page=post&s=view&id=[0-9]+/,
            ));
    // Extract rating
    var rating = "safe"; // default
    var tagList = document.getElementById("tag-list");
    if (tagList) {
        var headers = tagList.querySelectorAll('h3');
        for (var i = 0; i < headers.length; i++) {
            if (headers[i].textContent.includes("Statistics")) {
                var nextElement = headers[i].nextElementSibling;
                while (nextElement && nextElement.tagName === 'LI') {
                    if (nextElement.textContent.includes("Rating")) {
                        var ratingMatch = nextElement.textContent.match("Rating: ([a-zA-Z]+)");
                        if (ratingMatch) {
                            rating = ratingMatch[1];
                        }
                        break;
                    }
                    nextElement = nextElement.nextElementSibling;
                }
                break;
            }
        }
    }
    
    // Extract file URL
    var furl = "";
    if (tagList) {
        var headers = tagList.querySelectorAll('h3');
        for (var i = 0; i < headers.length; i++) {
            if (headers[i].textContent.includes("Options")) {
                var nextElement = headers[i].nextElementSibling;
                while (nextElement && nextElement.tagName === 'LI') {
                    if (nextElement.textContent.includes("Original image")) {
                        var link = nextElement.querySelector('a');
                        if (link) {
                            furl = link.href;
                        }
                        break;
                    }
                    nextElement = nextElement.nextElementSibling;
                }
                break;
            }
        }
    }
    // File size is not supported because it's not provided.

    if (supext.search(furl.match("[a-zA-Z0-9]+$")[0]) !== -1) {
        history.pushState(history.state, document.title, location.href);
        location.href =
            ste +
            furl +
            "&tags=" +
            encodeURIComponent(tag) +
            "&rating=" +
            encodeURIComponent(rating) +
            "&source=" +
            encodeURIComponent(source);
    } else {
        alert(notsup);
    }
} else if (
    /*
     * Shimmie
     *
     * One problem with shimmie is each theme does not show the same info
     * as other themes (I.E only the danbooru & lite themes show statistics)
     * Shimmie doesn't seem to have any way to grab tags via id unless you
     * have the ability to edit tags.
     *
     * Have to go the round about way of checking the title for tags.
     * This crazy way of checking "should" work with older releases though
     * (Seems to work with 2009~ ver)
     */
    document
        .getElementsByTagName("title")[0]
        .innerHTML.search("Image [0-9.-]+\: ") === 0
) {
    if (typeof tag !== "ftp://ftp." && chk !== 1) {
        var tag = document
            .getElementsByTagName("title")[0]
            .innerHTML.match("Image [0-9.-]+\: (.*)")[1];
    }

    // TODO: Make rating show in statistics.
    var source =
        "http://" +
        document.location.hostname +
        document.location.href.match("\/post\/view\/[0-9]+");

    // TODO: Make file size show on all themes
    // (Only seems to show in lite/Danbooru themes.)
    if (tag.search(/\bflash\b/) === -1) {
        var img = document.getElementById("main_image").src;
        if (supext.search(img.match(".*\\.([a-z0-9]+)")[1]) !== -1) {
            history.pushState(history.state, document.title, location.href);
            location.href = ste + img + "&tags=" + tag + "&source=" + source;
        } else {
            alert(notsup);
        }
    } else {
        var mov =
            document.location.hostname +
            document.getElementsByName("movie")[0].value;
        if (supext.search("swf") !== -1) {
            history.pushState(history.state, document.title, location.href);
            location.href = ste + mov + "&tags=" + tag + "&source=" + source;
        } else {
            alert(notsup);
        }
    }
}
