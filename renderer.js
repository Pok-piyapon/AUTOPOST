
console.log(window.electronAPI)
let data;

document.body.onload = async function () {
    window.electronAPI.commit({ type: "groups" })
}

async function start() {
    window.electronAPI.commit({ type: "start" })
}

async function addGroups() {
    const newGroups = document.getElementById("newGroups")
    window.electronAPI.commit({ type: "newGroups", data: newGroups.value })
    newGroups.value = ""
    window.electronAPI.commit({ type: "groups" })
}

function base64(file) {
    return new Promise((resolve,reject)=> {
        const reader = new FileReader
        reader.readAsDataURL(file)
        reader.onload = ()=> resolve(reader.result)
        reader.onerror = ()=> reject(false)
    })
}
async function addImage() {
    const filer = document.createElement("input")
    filer.setAttribute("type","file")
    filer.setAttribute("accept",".png,.jpg")
    filer.onchange = async()=> {
        const buffer = await base64(event.target.files[0])
        // แยกส่วนดึงเพียวภาพ
        const pure = buffer.split(";base64,").pop()
        // ส่งภาพหน้าบ้านไปประกอบหลังบ้าน
        window.electronAPI.commit({ type:"upload" , data:pure })
    }
    filer.click();
}

async function deleteGroups(text, id) {
    window.electronAPI.commit({ type: "delete", data: text, id })
}

async function deleteImage(fileName) {
    // throw filename to delete by name
    window.electronAPI.commit({ type:"deleteImage" , data:fileName })
}

async function logger() {
    let index = 0;
    let row = "";
    for (let i of data) {
        row +=
            `<tr>
                <td data-label="Name">${i.link}</td>
                <td id='BOT_${index}' data-label="Age" style="display:flex;justify-content:center;">
                    <div class="ui active inline loader"></div>
                </td>
            </tr>`
        index++;
    }
    Swal.fire({
        title: "<strong>บอทกำลังทำงาน...</strong>",
        icon: "warning",
        width: "60em",
        html: `
          <table class="ui celled table">
                <thead>
                    <tr>
                        <th>Link</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${row}
                </tbody>
            </table>
        `,
        cancelButtonText: `
          <button class="ui button">
                หยุดการทำงาน
          </button>
        `,
    });
}

async function SaveConfig(target) {
    window.electronAPI.commit({type:"config"})
}

async function Delay(target) {
    window.electronAPI.commit({type:"delay"})
}

async function SaveContent() {
    const content = document.getElementById("content")
    window.electronAPI.commit({type:"content" , data:content.value})
}

window.electronAPI.onReply((message) => {
    data = message.data
    if (message.type == "groups") {
        const content = document.getElementById("content")
        content.innerHTML = message.content
        const headless = document.getElementById("showProcess")
        const delay = document.getElementById("delay")
        if (message.headless == false) {
            headless.setAttribute("checked","")
        }else{
            headless.removeAttribute("checked")
        }
        if (message.delay == true) {
            delay.setAttribute("checked","")
        }else{
            delay.removeAttribute("checked")
        }
        const table = document.getElementById("groups")
        table.innerHTML = ""
        let index = 0;
        for (let i of message.data) {

            table.innerHTML +=
                `<tr>
                    <td data-label="Name">${i.link}</td>
                    <td data-label="Age">
                        <button onclick="deleteGroups('${i.link}',${index})" class="ui fluid red button">ลบ</button>
                    </td>
                </tr>`
            index++;
        }
        const tableImage = document.getElementById("images")
        for (let i of message.files) {
            tableImage.innerHTML +=
            `
                <tr>
                    <td style="width:100px;" data-label="Name">
                        <img style="width:100%;border-radius:5px;" src="./post/images/${i}" />
                    </td>
                    <td data-label="Name">
                        ${i}
                    </td>
                    <td data-label="Age">
                        <button onclick="deleteImage('${i}')" class="ui fluid red button">ลบ</button>
                    </td>
                </tr>
            `
        }
    }
    if (message.type == "botID") {
        const BOTEL = document.getElementById(`BOT_${message.id}`)
        BOTEL.innerHTML = `<i class="check icon"></i>`
    }
    if (message.type == "uploaded" || message.type == "deleteImage") {
        window.location.reload()
    }
});