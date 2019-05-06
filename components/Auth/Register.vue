<template>
    <div class="login">
      <div v-if="proccessing" class="text-center"> Please wait... </div>
      <div v-if="message" class="text-center"> {{message}} </div>
      <div class="form"> 
            <form>
               <input type="text" class="input" placeholder="Enter a username" v-model="username">
               <input type="text" class="input" placeholder="Enter your password" v-model="password">
                <input type="text" class="input" placeholder="Enter your Name" v-model="name">
               <button type="submit" class="submit"> Register </button>
            </form>
      </div>
      <div class="reader"> or login </div>
    </div>
</template>

<script>
export default {
  name: "register",
  data () {
    return {
      loading: false,
      username: "",
      password: "",
      name: "",
      proccessing: false,
      message: null
    }
  },
  created() {
    console.log('dsds')
  },
  methods: {
    login: function() {
      this.loading = true;
      this.axios
        .post("/login", {
          username: this.username,
          password: this.password
        })
        .then(response => {
          if (response.data.status == "success") {
            this.proccessing = false;
            this.$emit("authenticated", true, response.data.data);
          } else {
            this.message = "Login Faild, try again";
          }
        })
        .catch(error => {
          this.message = "Login Faild, try again";
          this.proccessing = false;
        });
    }
  }
 }
</script>

<style>
.register {
  width: 500px;
  border: 1px solid #cccccc;
  background-color: #ffffff;
  margin: auto;
  margin-top: 30vh;
  box-sizing: border-box;
}
.input-form {
  margin-bottom: 9px;
  display: block;
}
.input{
  display: block;
  margin: 15px;
  width: 94%;
  height: 40px;
  outline: none;
  font-size: 17px;
  text-indent: 5px;
}
.submit{
    display: block;
    width: 95%;
    margin: auto;
    padding: 20px;
    margin-bottom: 20px;
    font-size: 17px;
    cursor: pointer;
}
.reader{
    text-align: center;
    padding: 10px;
}
</style>