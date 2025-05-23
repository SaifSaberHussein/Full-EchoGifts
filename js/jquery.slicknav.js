/*!
 * SlickNav Responsive Mobile Menu v1.0.4
 * (c) 2015 Josh Cope
 * licensed under MIT
 */ (function ($, document, window) {
    var defaults = {
        label: "MENU",
        duplicate: true,
        duration: 200,
        easingOpen: "swing",
        easingClose: "swing",
        closedSymbol: "&#9658;",
        openedSymbol: "&#9660;",
        prependTo: "body",
        parentTag: "a",
        closeOnClick: false,
        allowParentLinks: false,
        nestedParentLinks: true,
        showChildren: false,
        removeIds: false,
        removeClasses: false,
        brand: "",
        init: function () { },
        beforeOpen: function () { },
        beforeClose: function () { },
        afterOpen: function () { },
        afterClose: function () { },
    },
        mobileMenu = "slicknav",
        prefix = "slicknav";
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = mobileMenu;
        this.init();
    }
    Plugin.prototype.init = function () {
        var $this = this,
            menu = $(this.element),
            settings = this.settings,
            iconClass,
            menuBar;
        if (settings.duplicate) {
            $this.mobileNav = menu.clone();
            $this.mobileNav.removeAttr("id");
            $this.mobileNav.find("*").each(function (i, e) {
                $(e).removeAttr("id");
            });
        } else {
            $this.mobileNav = menu;
            $this.mobileNav.removeAttr("id");
            $this.mobileNav.find("*").each(function (i, e) {
                $(e).removeAttr("id");
            });
        }
        if (settings.removeClasses) {
            $this.mobileNav.removeAttr("class");
            $this.mobileNav.find("*").each(function (i, e) {
                $(e).removeAttr("class");
            });
        }
        iconClass = prefix + "_icon";
        if (settings.label === "") {
            iconClass += " " + prefix + "_no-text";
        }
        if (settings.parentTag == "a") {
            settings.parentTag = 'a href="#"';
        }
        $this.mobileNav.attr("class", prefix + "_nav");
        menuBar = $('<div class="' + prefix + '_menu"></div>');
        if (settings.brand !== "") {
            var brand = $(
                '<div class="' + prefix + '_brand">' + settings.brand + "</div>"
            );
            $(menuBar).append(brand);
        }
        $this.btn = $(
            [
                "<" +
                settings.parentTag +
                ' aria-haspopup="true" tabindex="0" class="' +
                prefix +
                "_btn " +
                prefix +
                '_collapsed">',
                '<span class="' + prefix + '_menutxt">' + settings.label + "</span>",
                '<span class="' + iconClass + '">',
                '<span class="' + prefix + '_icon-bar"></span>',
                '<span class="' + prefix + '_icon-bar"></span>',
                '<span class="' + prefix + '_icon-bar"></span>',
                "</span>",
                "</" + settings.parentTag + ">",
            ].join("")
        );
        $(menuBar).append($this.btn);
        $(settings.prependTo).prepend(menuBar);
        menuBar.append($this.mobileNav);
        var items = $this.mobileNav.find("li");
        $(items).each(function () {
            var item = $(this),
                data = {};
            data.children = item.children("ul").attr("role", "menu");
            item.data("menu", data);
            if (data.children.length > 0) {
                var a = item.contents(),
                    containsAnchor = false,
                    nodes = [];
                $(a).each(function () {
                    if (!$(this).is("ul")) {
                        nodes.push(this);
                    } else {
                        return false;
                    }
                    if ($(this).is("a")) {
                        containsAnchor = true;
                    }
                });
                var wrapElement = $(
                    "<" +
                    settings.parentTag +
                    ' role="menuitem" aria-haspopup="true" tabindex="-1" class="' +
                    prefix +
                    '_item"/>'
                );
                if (
                    !settings.allowParentLinks ||
                    settings.nestedParentLinks ||
                    !containsAnchor
                ) {
                    var $wrap = $(nodes).wrapAll(wrapElement).parent();
                    $wrap.addClass(prefix + "_row");
                } else
                    $(nodes)
                        .wrapAll(
                            '<span class="' + prefix + "_parent-link " + prefix + '_row"/>'
                        )
                        .parent();
                if (!settings.showChildren) {
                    item.addClass(prefix + "_collapsed");
                } else {
                    item.addClass(prefix + "_open");
                }
                item.addClass(prefix + "_parent");
                var arrowElement = $(
                    '<span class="' +
                    prefix +
                    '_arrow">' +
                    (settings.showChildren
                        ? settings.openedSymbol
                        : settings.closedSymbol) +
                    "</span>"
                );
                if (
                    settings.allowParentLinks &&
                    !settings.nestedParentLinks &&
                    containsAnchor
                )
                    arrowElement = arrowElement.wrap(wrapElement).parent();
                $(nodes).last().after(arrowElement);
            } else if (item.children().length === 0) {
                item.addClass(prefix + "_txtnode");
            }
            item
                .children("a")
                .attr("role", "menuitem")
                .click(function (event) {
                    if (
                        settings.closeOnClick &&
                        !$(event.target)
                            .parent()
                            .closest("li")
                            .hasClass(prefix + "_parent")
                    ) {
                        $($this.btn).click();
                    }
                });
            if (settings.closeOnClick && settings.allowParentLinks) {
                item
                    .children("a")
                    .children("a")
                    .click(function (event) {
                        $($this.btn).click();
                    });
                item
                    .find("." + prefix + "_parent-link a:not(." + prefix + "_item)")
                    .click(function (event) {
                        $($this.btn).click();
                    });
            }
        });
        $(items).each(function () {
            var data = $(this).data("menu");
            if (!settings.showChildren) {
                $this._visibilityToggle(data.children, null, false, null, true);
            }
        });
        $this._visibilityToggle($this.mobileNav, null, false, "init", true);
        $this.mobileNav.attr("role", "menu");
        $(document).mousedown(function () {
            $this._outlines(false);
        });
        $(document).keyup(function () {
            $this._outlines(true);
        });
        $($this.btn).click(function (e) {
            e.preventDefault();
            $this._menuToggle();
        });
        $this.mobileNav.on("click", "." + prefix + "_item", function (e) {
            e.preventDefault();
            $this._itemClick($(this));
        });
        $($this.btn).keydown(function (e) {
            var ev = e || event;
            if (ev.keyCode == 13) {
                e.preventDefault();
                $this._menuToggle();
            }
        });
        $this.mobileNav.on("keydown", "." + prefix + "_item", function (e) {
            var ev = e || event;
            if (ev.keyCode == 13) {
                e.preventDefault();
                $this._itemClick($(e.target));
            }
        });
        if (settings.allowParentLinks && settings.nestedParentLinks) {
            $("." + prefix + "_item a").click(function (e) {
                e.stopImmediatePropagation();
            });
        }
    };
    Plugin.prototype._menuToggle = function (el) {
        var $this = this;
        var btn = $this.btn;
        var mobileNav = $this.mobileNav;
        if (btn.hasClass(prefix + "_collapsed")) {
            btn.removeClass(prefix + "_collapsed");
            btn.addClass(prefix + "_open");
        } else {
            btn.removeClass(prefix + "_open");
            btn.addClass(prefix + "_collapsed");
        }
        btn.addClass(prefix + "_animating");
        $this._visibilityToggle(mobileNav, btn.parent(), true, btn);
    };
    Plugin.prototype._itemClick = function (el) {
        var $this = this;
        var settings = $this.settings;
        var data = el.data("menu");
        if (!data) {
            data = {};
            data.arrow = el.children("." + prefix + "_arrow");
            data.ul = el.next("ul");
            data.parent = el.parent();
            if (data.parent.hasClass(prefix + "_parent-link")) {
                data.parent = el.parent().parent();
                data.ul = el.parent().next("ul");
            }
            el.data("menu", data);
        }
        if (data.parent.hasClass(prefix + "_collapsed")) {
            data.arrow.html(settings.openedSymbol);
            data.parent.removeClass(prefix + "_collapsed");
            data.parent.addClass(prefix + "_open");
            data.parent.addClass(prefix + "_animating");
            $this._visibilityToggle(data.ul, data.parent, true, el);
        } else {
            data.arrow.html(settings.closedSymbol);
            data.parent.addClass(prefix + "_collapsed");
            data.parent.removeClass(prefix + "_open");
            data.parent.addClass(prefix + "_animating");
            $this._visibilityToggle(data.ul, data.parent, true, el);
        }
    };
    Plugin.prototype._visibilityToggle = function (
        el,
        parent,
        animate,
        trigger,
        init
    ) {
        var $this = this;
        var settings = $this.settings;
        var items = $this._getActionItems(el);
        var duration = 0;
        if (animate) {
            duration = settings.duration;
        }
        if (el.hasClass(prefix + "_hidden")) {
            el.removeClass(prefix + "_hidden");
            if (!init) {
                settings.beforeOpen(trigger);
            }
            el.slideDown(duration, settings.easingOpen, function () {
                $(trigger).removeClass(prefix + "_animating");
                $(parent).removeClass(prefix + "_animating");
                if (!init) {
                    settings.afterOpen(trigger);
                }
            });
            el.attr("aria-hidden", "false");
            items.attr("tabindex", "0");
            $this._setVisAttr(el, false);
        } else {
            el.addClass(prefix + "_hidden");
            if (!init) {
                settings.beforeClose(trigger);
            }
            el.slideUp(duration, this.settings.easingClose, function () {
                el.attr("aria-hidden", "true");
                items.attr("tabindex", "-1");
                $this._setVisAttr(el, true);
                el.hide();
                $(trigger).removeClass(prefix + "_animating");
                $(parent).removeClass(prefix + "_animating");
                if (!init) {
                    settings.afterClose(trigger);
                } else if (trigger == "init") {
                    settings.init();
                }
            });
        }
    };
    Plugin.prototype._setVisAttr = function (el, hidden) {
        var $this = this;
        var nonHidden = el
            .children("li")
            .children("ul")
            .not("." + prefix + "_hidden");
        if (!hidden) {
            nonHidden.each(function () {
                var ul = $(this);
                ul.attr("aria-hidden", "false");
                var items = $this._getActionItems(ul);
                items.attr("tabindex", "0");
                $this._setVisAttr(ul, hidden);
            });
        } else {
            nonHidden.each(function () {
                var ul = $(this);
                ul.attr("aria-hidden", "true");
                var items = $this._getActionItems(ul);
                items.attr("tabindex", "-1");
                $this._setVisAttr(ul, hidden);
            });
        }
    };
    Plugin.prototype._getActionItems = function (el) {
        var data = el.data("menu");
        if (!data) {
            data = {};
            var items = el.children("li");
            var anchors = items.find("a");
            data.links = anchors.add(items.find("." + prefix + "_item"));
            el.data("menu", data);
        }
        return data.links;
    };
    Plugin.prototype._outlines = function (state) {
        if (!state) {
            $("." + prefix + "_item, ." + prefix + "_btn").css("outline", "none");
        } else {
            $("." + prefix + "_item, ." + prefix + "_btn").css("outline", "");
        }
    };
    Plugin.prototype.toggle = function () {
        var $this = this;
        $this._menuToggle();
    };
    Plugin.prototype.open = function () {
        var $this = this;
        if ($this.btn.hasClass(prefix + "_collapsed")) {
            $this._menuToggle();
        }
    };
    Plugin.prototype.close = function () {
        var $this = this;
        if ($this.btn.hasClass(prefix + "_open")) {
            $this._menuToggle();
        }
    };
    $.fn[mobileMenu] = function (options) {
        var args = arguments;
        if (options === undefined || typeof options === "object") {
            return this.each(function () {
                if (!$.data(this, "plugin_" + mobileMenu)) {
                    $.data(this, "plugin_" + mobileMenu, new Plugin(this, options));
                }
            });
        } else if (
            typeof options === "string" &&
            options[0] !== "_" &&
            options !== "init"
        ) {
            var returns;
            this.each(function () {
                var instance = $.data(this, "plugin_" + mobileMenu);
                if (
                    instance instanceof Plugin &&
                    typeof instance[options] === "function"
                ) {
                    returns = instance[options].apply(
                        instance,
                        Array.prototype.slice.call(args, 1)
                    );
                }
            });
            return returns !== undefined ? returns : this;
        }
    };
})(jQuery, document, window);
