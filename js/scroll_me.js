let ScrollMe = function(container_query, scroll_query, items_query) {
    return {
        width: 0,
        imageList: null,
        start: 0,
        end: 0,
        current: 0,
        step: 30,
        index: 1,
        scroll_content: null,
        container_query: null,
        _isScroll: false,
        init: function(container_query, scroll_query, items_query) {
            let parent = document.querySelector(container_query);
            this.scroll_content = document.querySelector(scroll_query);
            if (!parent || !this.scroll_content) {
                throw "should set the container";
            }
            parent.style.overflow = "hidden";
            this.container_query = container_query;
            this.width = parent.clientWidth;
            parent.style.position = "relative";
            this.scroll_content.style.position = "absolute";
            var firstNew = this.scroll_content.firstElementChild.cloneNode(true);
            var lastNew = this.scroll_content.lastElementChild.cloneNode(true);
            this.scroll_content.insertBefore(lastNew, this.scroll_content.firstElementChild);
            this.scroll_content.appendChild(firstNew, this.scroll_content.lastElementChild);
            this.imageList = items_query != undefined ? document.querySelectorAll(items_query) : this.scroll_content.children;
            for (var i = 0; i < this.imageList.length; i++) {
                var temp = this.imageList[i];
                temp.style.position = "absolute";
                temp.style.width = this.width + "px";
                temp.style.left = this.width * i + "px";
            }
            this.scroll_content.style.left = (-this.width) + "px";
            this._bindListener();
            parent = null;
        },
        _bindListener: function() {
            let self = this;
            this.scroll_content.addEventListener("touchstart", function(event) {
                if (self._isScroll) {
                    return;
                }
                let target = event.targetTouches[0];
                self.start = target.pageX;
            });
            this.scroll_content.addEventListener("touchmove", function(event) {
                if (self._isScroll) {
                    return;
                }
                let target = event.targetTouches[0];
                self.end = target.pageX;
                if (self.end < self.start) {
                    self.scroll_content.style.left = -(Math.abs(self.end - self.start) + self.index * self.width) + "px";
                } else {
                    // -784 320
                    self.scroll_content.style.left = -(self.index * self.width - Math.abs(self.end - self.start)) + "px";
                }
            });
            this.scroll_content.addEventListener("touchend", function(event) {
                if (self._isScroll) {
                    return;
                }
                if (Math.abs(self.end - self.start) > Math.floor(self.width / 4)) {
                    if (self.end < self.start) {
                        self.current = self.index * self.width + Math.abs(self.start - self.end);
                        self.index++;
                        self._scrollToLeft();
                    } else {
                        // -784 200 1->0  -784 ->0 -584->0   
                        self.current = self.index * self.width - Math.abs(self.start - self.end);
                        self.index--;
                        self._scrollToRight();
                    }
                    return;
                } else {
                    if (self.end < self.start) {
                        self.current = self.index * self.width + Math.abs(self.start - self.end);
                    } else {
                        self.current = self.index * self.width - Math.abs(self.start - self.end);
                    }
                    self._scrollReturn();
                    return;
                }
            });
            window.onresize = function() {
                let parent = document.querySelector(self.container_query);
                self.width = parent.clientWidth;
                for (var i = 0; i < self.imageList.length; i++) {
                    var temp = self.imageList[i];
                    temp.style.position = "absolute";
                    temp.style.width = self.width + "px";
                    temp.style.left = self.width * i + "px";
                }
                self.scroll_content.style.width = self.imageList.length * self.width;
                self.scroll_content.style.left = (-self.width * self.index) + "px";
            }
        },
        _scrollToLeft: function() {
            var self = this;
            _scroll();
            var cancel = null;
            function _scroll() {
                if (self.current > (self.width * self.index)) {
                    self.scroll_content.style.left = (-self.width * self.index) + "px";
                    if (self.index == self.imageList.length - 1) {
                        self.scroll_content.style.left = -self.width + "px";
                        self.index = 1;
                    }
                    self._isScroll = false;
                    window.cancelAnimationFrame(cancel);
                    return;
                }
                self.scroll_content.style.left = -self.current + "px";
                self.current += self.step;
                cancel = window.requestAnimationFrame(_scroll);
            }
        },
        _scrollToRight: function() {
            var self = this;
            _scroll();
            var cancel = null;
            function _scroll() {
                if (self.current < self.index * self.width) {
                    if (self.index == 0) {
                        self.scroll_content.style.left = -(self.width * (self.imageList.length - 2)) + "px";
                        self.index = self.imageList.length - 2;
                    } else {
                        self.scroll_content.style.left = (-self.width * self.index) + "px";
                    }
                    self._isScroll = false;
                    window.cancelAnimationFrame(cancel);
                    return;
                }
                self.scroll_content.style.left = -self.current + "px";
                self.current -= self.step;
                cancel = window.requestAnimationFrame(_scroll);
            }
        },
        _scrollReturn: function() {
            var self = this;
            var cancel = null;
            _scroll();
            function _scroll() {
                if (self.current < self.index * self.width) {
                    self._isScroll = false;
                    self.scroll_content.style.left = -(self.index * self.width) + "px";
                    window.cancelAnimationFrame(cancel);
                    return;
                }
                self.scroll_content.style.left = (-self.current) + "px";
                self.current -= self.step;
                cancel = window.requestAnimationFrame(_scroll);
            }
        },
        // 滑动到前一张
        scrollToPrev: function() {
            this._isScroll = true;
            this.current = this.index * this.width;
            this.index--;
            this._scrollToRight();
        },
        // 滑动到下一张
        scrollToNext: function() {
            this._isScroll = true;
            this.current = this.index * this.width;
            this.index++;
            this._scrollToLeft();
        },
        // 返回当前的所在的下标，方便设置active
        getCurrentIndex: function() {
            return this.index - 1;
        },
        // 滚动到指定的位置：数组下标的方式，需要点击按钮的方式。
        scrollToIndex: function(which) {
            var length = this.imageList.length;
            if (which < 0) {
                which = 0;
            }
            if (which > length - 3) {
                which = length - 3;
            }
            which++;
            if (which == self.index) {
                return;
            }
            this._isScroll = true;
            if (which > this.index) {
                this.current = this.index * this.width;
                this.index += (which - this.index);
                this._scrollToLeft();
            } else {
                this.current = this.index * this.width;
                this.index -= Math.abs(which - this.index);
                this._scrollToRight();
            }
        }
    };
}