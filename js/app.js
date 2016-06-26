/*model*/
function GameModel(configs) {
    this.configs = $.extend({
        container: $('#zone'),
        size: 4,
        similar: 2,
        timeStartShow: 1000,
        timeLimit: 2,
        rounds: 3
    }, configs);
    this.arrColors = [];
    this.arrProp = [];
    this.successArr = [];
    this.currentRoundPoints = 0;
    this.totalPoints = 0;
    this.currentRound = 1;
}
GameModel.prototype = {
    _createArrColors: function () {
        var params = {
            sc: $('#simpleColors'),
            hc: $('#heavyColors'),
            hue: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'monochrome'],
            c: (this.configs.size * this.configs.size) / this.configs.similar
        };
        if (params.sc.is(':checked')) {
            var rc = randomColor({count: params.c});
            for (var i = 0; i < this.configs.similar; i++) {
                this.arrColors = rc.concat(this.arrColors);
            }
        } else if (params.hc.is(':checked')) {
            var rhc = Math.random() * ((params.hue.length-1));
            rhc = Math.round(rhc);
            var rc = randomColor({hue: params.hue[rhc], count: params.c});
            for (var i = 0; i < this.configs.similar; i++) {
                this.arrColors = rc.concat(this.arrColors);
            }
        }
        this.arrColors.sort(function () {
            return Math.random() - 0.5;
        });
    },
    _buildArr: function () {
        for (var i = 0; i < this.configs.size * this.configs.size; i++) {
            $("<div/>", {
                'style': "background-color: " + this.arrColors[i] + ";",
                "class": "square"
            }).appendTo(this.configs.container);
        }
        this.items = $('.square');
    },
    _setCubeWidth: function () {
        var itemW = this.items.outerWidth(true),
            zoneW = itemW * this.configs.size;
        $(this.configs.container).css({
            width: zoneW
        });
    },
    _compareItems: function () {
        if (this._checkOnSimilar()) {
            if (this.arrProp.length === this.configs.similar) {
                this._gamePoints(true, false);
                // this._totalPoints();
                for (var i in this.arrProp) {
                    this.successArr.push(1);
                }
                this.arrProp = [];
            }
        } else {
            this._gamePoints(false, true);
            // this._totalPoints();
            for (var i in this.arrProp) {
                this._refreshDifferent(this.items.eq(this.arrProp[i]));
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
    },
    _refreshDifferent: function (diffItem) {
        setTimeout(function () {
            $(diffItem).css('background-color', '').removeClass('is-visible');
        }, 450);
    },
    _refreshAfterStart: function () {
        var items = this.items;
        setTimeout(function () {
            items.css({
                'background-color': ''
            });
        }, this.configs.timeStartShow);
    },
    _refreshRound: function () {
        this.arrProp = [];
        this.successArr = [];
        this.arrColors = [];
        this.currentRoundPoints = 0;
        $('#roundPoints').html(0);
        this.items.remove();
        this._createArrColors();
        this._buildArr();
        this._refreshAfterStart();
        clearInterval(globalInterval);
        $('#timerIndicator').css({
            'width': '100%',
            'background-color': 'green'
        });
        this._setTimeLimit();
    },
    _nextRound: function () {
        var countR = $('#round');
        if (this.currentRound === this.configs.rounds) {
            return false;
        }
        this.currentRound++;
        countR.html(this.currentRound);
    },
    _buttonStatus: function () {
        $('.startGame').attr('disabled', 'disabled');
        $('.refreshGame').removeAttr('disabled');
    },
    _setTimeLimit: function () {
        var a = this.configs.timeLimit,
            b = a * 60 * 100,
            c = 100 / b,
            d = 0,
            e = 0,
            f = $('#timerIndicator'),
            g = $('#timer'),
            self = this;
        setTimeout(function () {
            globalInterval = setInterval(function () {
                e += c;
                d = 100 - e;
                f.css({
                    'width': d + '%'
                });
                if (d > 0) {
                    f.css({
                        'background-color': '#ca4100'
                    });
                }
                if (d > 25) {
                    f.css({
                        'background-color': '#e46c33'
                    });
                }
                if (d > 50) {
                    f.css({
                        'background-color': '#b9981e'
                    });
                }
                if (d > 75) {
                    f.css({
                        'background-color': 'green'
                    });
                }
                if (d < 0) {
                    self._pastLimitedTime();
                }
            }, 10);
        }, this.configs.timeStartShow);
        g.css('visibility', 'visible');

    },
    _pastLimitedTime: function () {
        if (confirm('Press ok to play again')) {
            $('#timerIndicator').css({
                'width': '100%',
                'background-color': 'green'
            });
            this._refreshRound();
            clearInterval(globalInterval);
        } else {
            clearInterval(globalInterval);
            $(document).off('click', '.square');
            $('.refreshGame').attr('disabled', 'disabled');
        }
    },
    _gamePoints: function (right, wrong) {
        var rp = $('#roundPoints'),
            tp = $('#totalPoints');
        if (right === true) {
            this.currentRoundPoints += 5;
            this.totalPoints += 5;
            rp.html(this.currentRoundPoints);
            tp.html(this.totalPoints)
        }
        else if (wrong === true) {
            this.currentRoundPoints--;
            this.totalPoints--;
            rp.html(this.currentRoundPoints);
            tp.html(this.totalPoints);
        }
    },
    _endRound: function () {
        if (this.successArr.length === (this.configs.size * this.configs.size)) {
            if (this.configs.rounds !== this.currentRound) {
                if (confirm('Next round?')) {
                    this.configs.timeLimit /= 2;
                    this._refreshRound();
                    this._nextRound();
                }
                else {
                    this._lockGame();
                }
            }
            else {
                this._lockGame();
                alert("Congratulation!!!, Total points  " + this.totalPoints + " ");
            }
        }
    },
    _lockGame: function () {
        clearInterval(globalInterval);
        $(document).off('click', '.square');
        $('.refreshGame').attr('disabled', 'disabled');
    }
};


function GameController() {
    _model = new GameModel({
        container: $('#zone'),
        size: 3,
        similar: 3,
        timeStartShow: 1000,
        timeLimit: 1, //minutes
        rounds: 3
    });
    this.startGame = function () {
        _model._buttonStatus();
        _model._createArrColors();
        _model._buildArr();
        _model._setCubeWidth();
        _model._refreshAfterStart();
        _model._setTimeLimit();
    };
    this.refreshGame = function () {
        _model._refreshRound();
    };
    this.clickOnElement = function () {
        $(document).on('click', '.square', function () {
            var $thisItem = $(this);
            _model._setColorItem($thisItem);
            _model._compareItems();
            _model._endRound();
        });
    };
}
GameController.prototype.init = function () {
    var self = this;
    $('.startGame').on('click', function () {
        self.startGame();
    });
    $('.refreshGame').on('click', function () {
        self.refreshGame();
    });
    self.clickOnElement();
};

var globalInterval;
$(document).ready(function () {
    new GameController().init();
});
