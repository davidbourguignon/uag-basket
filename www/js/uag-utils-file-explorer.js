/** jshint forin:true, noarg:true, noempty:true, eqeqeq:true,
 *  bitwise:true, strict:true, undef:true, unused:true, curly:true,
 *  browser:true, devel:true, jquery:true, es5:true, indent:4, maxerr:50
 */
/**
 * @fileOverview uAg Utils File Explorer
 * @author <a href="http://www.davidbourguignon.net">David Bourguignon</a>
 * @version 2012-09-11
 */
var uag = (function(parent, $, window, document, undefined) {
    'use strict';
    // namespace declaration
    var uAgUtils = parent.utils = parent.utils || {};

    // is there a better way to achieve this file exploring capability?
    // ideally should be a subclass of controller?
    // rename vars with type suffixes (arr, str, etc.) to make them more explicit
    // TODO

    /**
     * @class
     * @returns File explorer object
     * @exports uAgUtils.makeFileExplorer as uag.utils.makeFileExplorer
     * @description File explorer is a full-fledged component containing a small model, view and controller inside.
     */
    uAgUtils.makeFileExplorer = function() {
        /**
         * @private
         */
        // view objects
        var gridDiv = null;
        var folderDiv = null;
        var fileDiv = null;
        var backDiv = null;

        // file API objects
        var rootDir = null;
        var currentDir = null;
        var parentDir = null;
        var activeEntry = null;

        // callbacks from caller
        var onFileCheck = null;

        // other vars
        var directoryEntries = [];
        var fileEntries = [];

        // callback functions
        /** @ignore */
        function onFileError(fileError) {
            throw new Error('Error: failed with code ' + fileError.code);
        }

        /** @ignore */
        function onRequestFileSystemSuccess(fileSystem) {
            rootDir = fileSystem.root;
            console.info('Info: root directory name is ' + rootDir.name);
            showDirectory(rootDir);
        }

        /** @ignore */
        function onGetParentSuccess(parent) {
            parentDir = parent;
            console.info('Info: parent directory name is ' + parentDir.name);
        }

        /** @ignore */
        function onReadEntriesSuccess(entries) {
            directoryEntries.length = 0; // emptying arrays
            fileEntries.length = 0;
            var i, len; // vars for loops
            for (i = 0, len = entries.length; i < len; i++) {
                var entry = entries[i];
                if (entry.isDirectory && entry.name[0] !== '.') { // removing hidden files
                    directoryEntries.push(entry);
                } else if (entry.isFile && entry.name[0] !== '.') {
                    fileEntries.push(entry);
                }
            }
            var sortedEntries = directoryEntries.concat(fileEntries);
            gridDiv.empty();
            gridDiv.append('<h4> Folder ' + currentDir.name + '</h4>');
            var uiBlockLetters = ['a','b','c'];
            for (i = 0, len = sortedEntries.length; i < len; i++) {
                var blockLetter = uiBlockLetters[i%3]; // length uiBlockLetters = 3
                var sortedEntry = sortedEntries[i];
                if (sortedEntry.isDirectory) {
                    gridDiv.append('<div class="ui-block-' +
                                   blockLetter +
                                   '"><div class="folder"><p>' +
                                   sortedEntry.name +
                                   '</p></div></div>');
                } else if (sortedEntry.isFile) {
                    gridDiv.append('<div class="ui-block-' +
                                   blockLetter +
                                   '"><div class="file"><p>' +
                                   sortedEntry.name +
                                   '</p></div></div>');
                }
            }
            folderDiv = $('.folder');
            fileDiv = $('.file');
            folderDiv.on('click', onFolderDivClick);
            fileDiv.on('click', onFileDivClick);
            if (currentDir !== null && currentDir.name !== rootDir.name) {
                gridDiv.append('<div class="ui-block-a"><div class="folder back"><p>..</p></div></div>');
                backDiv = $('.folder.back');
                backDiv.on('click', onBackDivClick);
            }
        }

        /** @ignore */
        function onGetDirectorySuccess(directoryEntry) {
            activeEntry = directoryEntry;
            showDirectory(activeEntry);
        }

        /** @ignore */
        function onFolderDivClick(event) {
            var name = $(event.target).text();
            if (currentDir !== null) {
                currentDir.getDirectory(name, {create:false},
                                        onGetDirectorySuccess,
                                        onFileError);
            } else {
                throw new Error('Error: current directory does not exist');
            }

        }

        /** @ignore */
        function onGetFileSuccess(fileEntry) {
            activeEntry = fileEntry;
            readFile(activeEntry);
        }

        /** @ignore */
        function onFileDivClick(event) {
            // put an effect with hover, then click down and click up (same for files)
            // TODO
            var name = $(event.target).text();
            if (currentDir !== null) {
                currentDir.getFile(name, {create:false},
                                   onGetFileSuccess,
                                   onFileError);
            } else {
                throw new Error('Error: current directory does not exist');
            }
        }

        /** @ignore */
        function onBackDivClick(event) {
            // same idea: put an effect, this time a bit special
            // TODO
            if (parentDir !== null) {
                showDirectory(parentDir);
            }
        }

        /** @ignore */
        function onFileReaderLoadEnd(event) {
            var fileReadStr = event.target.result;
            //console.info('Info: > file content is');
            //console.info(fileReadStr);
            var isFileChecked = onFileCheck(fileReadStr);
            if (!isFileChecked) {
                // use jQuery Mobile 1.2.0 popup
                // TODO
                console.warn('Warning: file is not checked');
            }
        }

        /** @ignore */
        function onFileSuccess(file) {
            console.info('Info: file details\n' +
                         'Info: > file name is ' + file.name + '\n' +
                         'Info: > file type is ' + file.type + '\n' +
                         'Info: > file date is ' + new Date(file.lastModifiedDate) + '\n' +
                         'Info: > file size is ' + file.size + ' bytes');
            var reader = new FileReader();
            reader.onloadend = onFileReaderLoadEnd;
            reader.readAsText(file);
        }

        // other functions
        /** @ignore */
        function showDirectory(directoryEntry) {
            if (directoryEntry.isDirectory) {
                currentDir = directoryEntry;
                console.info('Info: current directory name is ' + currentDir.name);
                directoryEntry.getParent(onGetParentSuccess, onFileError);
            } else {
                throw new TypeError('Error: expecting directory object');
            }
            var directoryReader = directoryEntry.createReader();
            directoryReader.readEntries(onReadEntriesSuccess,
                                        onFileError);
        }

        /** @ignore */
        function readFile(fileEntry){
            if (fileEntry.isFile) {
                fileEntry.file(onFileSuccess, onFileError);
            } else {
                throw new TypeError('Error: expecting file object');
            }
        }

        /**
         * @public
         * @lends uag.utils.makeFileExplorer
         */
        return {
            /**
             *  @param {object} $gridDiv JQuery Mobile object refering to a div with a 3-row grid class.
             *  @param {function} fileCheckCb Callback invoked when checking the chosen file. <em>Params: fileStr (string). Returns: boolean.</em>
             *  @throws {TypeError} If $gridDiv type is not div[class="ui-grid-b"].
             **/
            run: function($gridDiv, fileCheckCb) {
                // how to make sure this is called after onDeviceReady has fired?
                // TODO

                // set params
                if ($gridDiv instanceof jQuery &&
                    $gridDiv.is('div[class="ui-grid-b"]')) {
                    gridDiv = $gridDiv;
                } else {
                    throw new TypeError('Error: expecting explorer view objects');
                }
                onFileCheck = fileCheckCb;

                // get root directory of the local file system
                if (gridDiv !== null) {
                    if (rootDir !== null) {
                        if (currentDir.name !== rootDir.name) {
                            showDirectory(currentDir);
                        } else {
                            showDirectory(rootDir);
                        }
                    } else {
                        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                                                 onRequestFileSystemSuccess,
                                                 onFileError);
                    }
                } else {
                    throw new Error('Error: explorer view objects are not set');
                }
            },
        };
    };

    return parent;
}(uag || {}, jQuery, this, this.document));
