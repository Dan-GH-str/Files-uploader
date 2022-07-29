function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (!bytes) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}

const element = (tag, classes = [], content) => {
    const node = document.createElement(tag)

    if (classes.length > 0) {
        node.classList.add(...classes)
    }

    if (content) {
        node.textContent = content
    }

    return node
} 

function noop() {}

export function upload(selector, options = {}) {
    let files = []
    const input = document.querySelector(selector)
    const preview = element('div', ['preview'])
    const openBtn = element('button', ['btn'], 'Открыть')
    const uploadBtn = element('button', ['btn', 'primary'], 'Загрузить')
    uploadBtn.style.display = 'none'
    const onUpload = options.onUpload ?? noop
    
    if (options.multi) {
        input.setAttribute('multiple', true)
    }

    if (options.accept) {
        input.setAttribute('accept', options.accept.join(','))
    }
    
    input.insertAdjacentElement('afterend', preview)
    input.insertAdjacentElement('afterend', uploadBtn)
    input.insertAdjacentElement('afterend', openBtn)

    const triggerInput = () => input.click()

    const changeHandler = event => {
        if (!event.target.files.length) {
            return
        }

        files = Array.from(event.target.files);                // Получаем переданные файлы
        
        preview.innerHTML = ''
        files.forEach(file => {
            if (!file.type.match('image')) {
                return
            }

            uploadBtn.style.display = 'inline'
            const reader = new FileReader()

            reader.onload = ev => {
                preview.insertAdjacentHTML('afterbegin', `
                <div class="preview-image">
                    <span class="preview-image-remove" data-name="${file.name}">&times;</span>
                    <img src="${ev.target.result}" alt="${file.name}" />
                    <div class="preview-info">
                        <span>${file.name.length <= 14 ? file.name : file.name.substr(0, 14) + '...'}</span>
                        ${bytesToSize(file.size)}
                    </div>
                </div>
                `)
            }

            reader.readAsDataURL(file)
        })
    }

    const removeHandler = event => {
        if (!event.target.dataset.name) {
            return
        }

        const {name} = event.target.dataset
        files = files.filter(file => file.name !== name)

        if (!files.length) {
            uploadBtn.style.display = 'none'
        }

        const block = preview
            .querySelector(`[data-name="${name}"]`)
            .closest('.preview-image')                  // Ближайший родитель по селектору
        
        block.classList.add('removing')
        setTimeout(() => block.remove(), 300)
    }

    const clearPreview = (el) => {
        el.style.bottom = '0px'
        el.innerHTML = `<div class="preview-info-progress"></div>`
    }

    const uploadHandler = () => {
        preview.querySelectorAll('.preview-image-remove').forEach(e => e.remove())
        const previewInfo = preview.querySelectorAll('.preview-info')
        previewInfo.forEach(clearPreview)

        onUpload(files, previewInfo)
    }

    openBtn.addEventListener('click', triggerInput)
    input.addEventListener('change', changeHandler)
    preview.addEventListener('click', removeHandler)
    uploadBtn.addEventListener('click', uploadHandler)
}