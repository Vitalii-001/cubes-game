/*model*/
function GameModel(size, similar) {
    this.size = size;
    this.similar = similar;
    this.compareAr = [];
    this.arrColors = [];
    this.arrProp = [];
    this.successArr = [];
}
GameModel.prototype = {
    _createArrColors: function () {
        var concatColorsArr = [],
                ColorsArr = [],
                countItems = this.size * this.size,
                oneArrColors = (this.size * this.size) / this.similar;
        for (var j = 0; j < oneArrColors; j++) {
            ColorsArr.push("#" + Math.random().toString(16).slice(2, 8));
        }
        for (var i = 0; i < this.similar; i++) {
            concatColorsArr = ColorsArr.concat(concatColorsArr);
        }
        concatColorsArr.sort(compareRandom);
        this.arrColors = concatColorsArr;
        return concatColorsArr;
    },
    _buildArr: function () {
        for (var i = 0; i < this.size * this.size; i++) {
            $("<div/>", {
                'style': "background-color: " + this.arrColors[i] + ";",
                "class": "square"
            }).appendTo("#zone");
        }
        this.items = $('.square');
        var itemW = this.items.outerWidth(true),
                zoneW = itemW * this.size;
        $("#zone").css({
            width: zoneW
        });
    },
    _endGame: function () {
        if (this.successArr.length === (this.size * this.size)) {
            alert('Finish');
        }
    },
    _compareItems: function () {

        if (this._checkOnSimilar()) {
            if (this.arrProp.length === this.similar) {
                for (var i in this.arrProp) {
                    this.successArr.push(1);
                }
                this.arrProp = [];
            }
        } else {
            for (var i in this.arrProp) {
                this._refresh(this.items.eq(this.arrProp[i]));
            }
            this.arrProp = [];
        }
    },
    _setColorItem: function (clicked) {
        var index = clicked.index();
        if (this.arrProp.indexOf(index) === -1) {
            this.arrProp.push(index);
        }
        clicked.css({
            'background-color': this.arrColors[index]
        }).addClass('is-visible');
    },
    _checkOnSimilar: function () {
        for (var i = 1; this.arrProp.length > i; i++) {
            if (this.arrColors[this.arrProp[0]] !== this.arrColors[this.arrProp[i]]) {
                return false;
            }
        }
        return true;
        //else {
        //  this._refresh(this.items.eq(this.arrProp[i]));
        //}
    },
    _clickOnDifferent: function () {
        for (var i in this.arrProp) {
            if (this.arrColors[this.arrProp[0]] !== this.arrColors[this.arrProp[++i]]) {
                return true;
            }
        }
    },
    _refresh: function (diffItem) {
        setTimeout(function () {
            $(diffItem).css('background-color', '').removeClass('is-visible');
        }, 450);
    },
    _refreshAll: function () {
        var items = this.items;
        setTimeout(function () {
            items.css({
                'background-color': ''
            });
        }, 1000);
    }
};


function GameController() {
    _model = new GameModel(3, 3);
    this.startGame = function () {
        _model._createArrColors();
        _model._buildArr();
        _model._refreshAll();
    };
    this.clickOnElement = function () {
        $(document).on('click', '.square', function () {
            var $thisItem = $(this);
            _model._setColorItem($thisItem);
            _model._compareItems();
            _model._endGame();
        });
    };
}
GameController.prototype.init = function () {
    var self = this;
    $(document).on('click', '#startGame', function () {
        self.startGame();
    });
    self.clickOnElement();
};

function compareRandom() {
    return Math.random() - 0.5;
}


$(document).ready(function () {
    new GameController().init();
});
