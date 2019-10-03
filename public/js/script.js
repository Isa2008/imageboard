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
                // header: "sassafras <3"
            };
        },
        mounted: function() {
            console.log("this in component: ", this);

            var me = this;
            axios
                .get("/images/" + this.id)
                .then(function(response) {
                    // console.log("response from get /images + id: ", response);
                    me.image = response.data.rows[0];
                    console.log("response data: ", response.data);
                })
                .catch(err => {
                    console.log("err in get /images + id: ", err);
                });

            axios
                .get("/comments/" + this.id)
                .then(function(response) {
                    console.log("data from comment is: ", response.data);
                    me.comments = response.data;
                })
                .catch(err => {
                    console.log(err);
                });

            // console.log("Mounted is running!");
            // mounted works the same as mounted in Vue instance
            // only diference is this function runs when the COMPONENT mounts!
        },

        // SET UP A WATCHER //
        watch: {
            id: function() {
                var me = this;
                axios.get("/image/" + this.id).then(function(response) {
                    console.log("Image data is: ", response.data);
                });
                console.log(me.images);
            }
        },

        methods: {
            closeModal: function() {
                // console.log("closeModal running!");
                this.$emit("close");
            },

            myClick: function() {
                console.log("myClick running!");
            },

            handleClick: function(e) {
                e.preventDefault();
                console.log("this: ", this);
                var commentData = {
                    comment: this.comment,
                    username: this.cusername,
                    id: this.id
                };
                console.log("Data I'm passing to Server ", commentData);

                var me = this;

                axios
                    .post("/comment", commentData)
                    .then(function(res) {
                        console.log("response from Post /comment: ", res);
                        me.comments.unshift(res.data[0]);
                    })
                    .catch(function(err) {
                        console.log("err in Post /comment: ", err);
                    });
            },
            clickMore: function() {
                console.log("clickMore button");
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
            // console.log("My vue has mounted!");
            var me = this;
            axios.get("/images").then(function(response) {
                me.images = response.data;
            });

            addEventListener("hashchange", function() {
                console.log("location.hash: ", location.hash);

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

        // every function that runs in response to an event
        methods: {
            clickMore: function() {
                var me = this;
                console.log("clickMore button is running!: ", this.images);
                axios
                    .get("/getmore/" + this.images[this.images.length - 1].id)
                    .then(function(response) {
                        // console.log(response.data);
                        // me.images = response.data;
                        // add the images to end of the array
                        me.images.push(...response.data);

                        console.log("lowestId: ", response.data[0].lowestId);
                        console.log(
                            "Counting down the image id: ",
                            me.images[me.images.length - 1].id
                        );
                        if (
                            response.data[0].lowestId ==
                            me.images[me.images.length - 1].id
                        ) {
                            me.showPics = false;
                        }
                    });
            },

            closeModalOnParent: function() {
                console.log("closeModalOnParent running!");
                location.hash = "";
                this.showModal = false;
                this.id = "";
                history.pushState({}, "", "/");
            },

            // showTitleMethod: function(title) {
            //     console.log("showTitleMethod");
            //
            //     // this is the Vue instance
            //     this.showModal = true;
            //     // show img, title, description, username
            //     this.title = title;
            // },

            showModalMethod: function(id) {
                console.log("id: ", id);
                this.showModal = true;
                this.id = id;
            },

            handleClick: function(e) {
                e.preventDefault();
                console.log("this: ", this);

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                var me = this;
                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        console.log("resp from post /upload: ", resp);

                        var img = resp.data;
                        console.log("resp data: ", resp.data);
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
                console.log("myImageBoard is running!", imageName);
            }
        }
    });
})();
