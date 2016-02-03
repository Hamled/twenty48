var TWENTY48 = $.extend(TWENTY48, {
  Display: function() {
    return {
      update: function(events) {
        var display = this;
        events.forEach(function(event) {
          display.handleEvent(event);
        });
      },

      handleEvent: function(event) {
        var TYPES = TWENTY48.CONSTS.EVENT_TYPES;
        switch(event.type) {
          case TYPES.MOVE:
            // Move the source tile to its new location
            this.tileAt(event.source)
                .moveTo(event.destination);
            break;
          case TYPES.COMBINE:
            // Destroy the destination tile after
            this.tileAt(event.destination)
                .delay(this._tileAnimTime())
                .destroy();

            // Move the source tile and then promote it afterwards
            this.tileAt(event.source)
                .moveTo(event.destination)
                .delay(this._tileAnimTime())
                .promote(event.newValue);
            break;
        }
      },

      tileAt: function(loc) {
        var selector = ".tile";
        selector += "[data-row=\"r"+loc.row+"\"]";
        selector += "[data-col=\"c"+loc.col+"\"]";

        this._promises.unshift($(selector).promise());
        return this;
      },

      moveTo: function(loc) {
        var promise = this._promises[0];
        if (promise) {
          promise.then(function() {
            var tile = this[0];
            tile.dataset.row = "r"+loc.row;
            tile.dataset.col = "c"+loc.col;
          });
        }

        return this;
      },

      delay: function(milliseconds) {
        var promise = this._promises[0];
        if (promise) {
          // Create a deferred that will resolve after X ms
          var delayDeferred = new $.Deferred();
          setTimeout(function() {
            delayDeferred.resolve();
          }, milliseconds);

          // Attach it to our existing promise
          promise.then(delayDeferred);
        }

        return this;
      },

      promote: function(newValue) {
        var promise = this._promises[0];
        if (promise) {
          promise.then(function() {
              var tile = this[0];
              tile.dataset.val = newValue;
              this.text(newValue);
          });
        }

        return this;
      },

      destroy: function() {
        var promise = this._promises[0];
        if (promise) {
          promise.then(function() {
            // TODO: Move this tile to storage queue for fast additions
            this.remove();
          });
        }

        return this;
      },

      _tileAnimTime: function() {
        return Number.parseFloat($(".tile").css("transition-duration")) * 1000;
      },

      _promises: []
    };
  }
});
