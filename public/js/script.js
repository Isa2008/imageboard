(function() {
    //// VUE COMPONENT ////
    Vue.component("image-modal", {
        template: "#image-modal-template",
        props: ["id"],
        data: function() {
            return {
                image: {},
                comment: "",
                cusername: "",
                comments: ""
            };
        },
        mounted: function() {
            var me = this;
            axios
                .get("/images/" + this.id)
                .then(function(response) {
                    me.image = response.data.rows[0];
                })
                .catch(err => {
                    console.log("err in get /images + id: ", err);
                });

            axios
                .get("/comments/" + this.id)
                .then(function(response) {
                    me.comments = response.data;
                })
                .catch(err => {
                    console.log(err);
                });
        },

        watch: {
            id: function() {
                var me = this;
                axios.get("/image/" + this.id).then(function(response) {
                });
            }
        },

        methods: {
            closeModal: function() {
                this.$emit("close");
            },

            myClick: function() {
            },

            handleClick: function(e) {
                e.preventDefault();
                var commentData = {
                    comment: this.comment,
                    username: this.cusername,
                    id: this.id
                };

                var me = this;

                axios
                    .post("/comment", commentData)
                    .then(function(res) {
                        me.comments.unshift(res.data[0]);
                    })
                    .catch(function(err) {
                        console.log("err in post /comment: ", err);
                    });
            },
            clickMore: function() {
            }
        }
    });

    //// VUE INSTANCE ////
    new Vue({
        el: "#main",
        data: {
            id: location.hash.slice(1),
            showModal: false,
            images: [],
            showPics: true,
            file: null,
            title: "",
            description: "",
            username: "",
            myUserColor: "usercolor"
        },

        mounted: function() {
            var me = this;
            axios.get("/images").then(function(response) {
                me.images = response.data;
            });

            addEventListener("hashchange", function() {
                if (
                    location.hash.slice(1) != "" &&
                    !isNaN(location.hash.slice(1))
                ) {
                    me.id = location.hash.slice(1);
                    me.showModal = true;
                } else {
                    me.closeModalOnParent();
                }
            });
        },

        methods: {
            clickMore: function() {
                var me = this;
                axios
                    .get("/getmore/" + this.images[this.images.length - 1].id)
                    .then(function(response) {
                        me.images.push(...response.data);
                        if (
                            response.data[0].lowestId ==
                            me.images[me.images.length - 1].id
                        ) {
                            me.showPics = false;
                        }
                    });
            },

            closeModalOnParent: function() {
                location.hash = "";
                this.showModal = false;
                this.id = "";
                history.pushState({}, "", "/");
            },

            showModalMethod: function(id) {
                this.showModal = true;
                this.id = id;
            },

            handleClick: function(e) {
                e.preventDefault();
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                var me = this;
                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        var img = resp.data;
                        me.images.unshift(img);
                    })
                    .catch(function(err) {
                        console.log("err in post /upload: ", err);
                    });
            },

            handleChange: function(e) {
                this.file = e.target.files[0];
            },

            myImageBoard: function(imageName) {
            }
        }
    });
})();
