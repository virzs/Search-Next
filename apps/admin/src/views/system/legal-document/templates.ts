import type {
  LegalDocumentRecord,
  LegalDocumentType,
} from "@/services/system/legal-document";

type LegalDocumentTemplate = Pick<
  LegalDocumentRecord,
  "title" | "content" | "changeSummary"
>;

export const normalizeLegalDocumentContent = (value?: string) => {
  if (!value) return "";
  if (!/<\/?(?:p|h[1-6]|ul|ol|li|strong|em|br)\b/i.test(value)) {
    return value;
  }
  return value
    .trim()
    .replace(/^[\t ]+/gm, "")
    .replace(/<h2>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3>([\s\S]*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<ul>\s*/gi, "")
    .replace(/\s*<\/ul>/gi, "\n")
    .replace(/<ol>\s*/gi, "")
    .replace(/\s*<\/ol>/gi, "\n")
    .replace(/<li>([\s\S]*?)<\/li>/gi, "- $1\n")
    .replace(/<p>([\s\S]*?)<\/p>/gi, "$1\n\n")
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[\t ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const privacyTemplate: LegalDocumentTemplate = {
  title: {
    "zh-CN": "Search Next 隐私政策",
    "en-US": "Search Next Privacy Policy",
  },
  content: {
    "zh-CN": `
      <p><strong>生效日期：以本页面显示的发布日期为准</strong></p>
      <p>欢迎使用 Search Next。我们重视你的隐私和个人信息安全。本隐私政策说明我们在你使用 Search Next 网站、账号、桌面配置、搜索、备份及相关功能时，如何收集、使用、保存、共享和保护信息，以及你可以如何行使相关权利。</p>
      <h2>一、适用范围</h2>
      <p>本政策适用于 Search Next 提供的网页、账号及相关在线服务。通过 Search Next 跳转或接入的第三方网站、搜索引擎、应用和服务由相应第三方独立运营，其信息处理活动适用第三方自己的隐私政策。</p>
      <h2>二、我们处理的信息</h2>
      <h3>1. 账号与身份信息</h3>
      <p>当你注册或登录时，我们可能处理用户名、电子邮箱、加密后的密码、验证码验证结果、邀请码、账号状态、角色权限、注册时间和登录时间。密码以不可逆加密形式保存，我们不会保存你的明文密码。</p>
      <h3>2. 安全与运行日志</h3>
      <p>为了保障账号和服务安全、排查故障并防止滥用，我们可能处理 IP 地址、浏览器类型、User-Agent、设备与系统信息、访问时间、请求记录、异常信息、登录会话和安全验证结果。</p>
      <h3>3. 配置、偏好与用户数据</h3>
      <p>当你使用桌面布局、主题、壁纸、应用、小组件、快捷方式、搜索偏好、历史记录、开发者配置或备份功能时，我们会根据功能需要处理相关配置。部分数据仅保存在你的浏览器本地；只有在你主动登录、同步、创建云备份或使用需要服务端保存的功能时，相应数据才会发送至服务器。</p>
      <h3>4. 搜索及第三方跳转信息</h3>
      <p>当你使用搜索建议、第三方搜索引擎或外部应用时，搜索词、目标地址或必要请求信息可能被发送给你选择的第三方服务。第三方如何处理这些信息由其隐私政策决定。请不要在搜索词中输入密码、身份证号、支付信息等敏感信息。</p>
      <h3>5. 反馈与联系信息</h3>
      <p>当你通过产品内反馈渠道联系我们时，我们会处理你主动提供的反馈内容、联系方式、截图和诊断信息，以便响应请求和解决问题。</p>
      <h2>三、我们如何使用信息</h2>
      <ul>
        <li>创建、验证和维护账号，提供登录、同步与备份能力；</li>
        <li>保存和恢复你主动提交的配置与数据；</li>
        <li>提供搜索、应用、小组件、主题及其他产品功能；</li>
        <li>检测欺诈、攻击、异常登录和违反服务条款的行为；</li>
        <li>分析故障、改善性能、优化产品体验并提供客户支持；</li>
        <li>履行法律法规要求以及保护用户、公众和服务安全。</li>
      </ul>
      <p>我们仅在实现明确、合理目的所必需的范围内处理信息，不会出售你的个人信息，也不会将信息用于与上述目的无关的用途。</p>
      <h2>四、本地存储、Cookie 与类似技术</h2>
      <p>Search Next 可能使用 Cookie、LocalStorage、SessionStorage、IndexedDB 或类似浏览器技术保存登录状态、界面偏好、桌面配置、未读状态和安全信息。你可以通过浏览器设置清理这些数据，但这可能导致退出登录、偏好丢失或部分功能无法正常使用。</p>
      <h2>五、第三方服务与信息共享</h2>
      <p>为提供必要功能，我们可能使用邮件发送、安全验证、对象存储、内容分发、搜索引擎等第三方服务。例如，人机验证可能由 Cloudflare Turnstile 提供。我们仅向服务提供商提供完成相应功能所必需的信息，并要求其按照适用法律和约定保护信息。</p>
      <p>除以下情形外，我们不会向无关第三方披露你的个人信息：</p>
      <ul>
        <li>已获得你的明确授权；</li>
        <li>为履行你主动请求的服务所必需；</li>
        <li>根据法律法规、司法或行政机关的合法要求；</li>
        <li>为保护用户、公众、Search Next 或其他主体的合法权益和安全。</li>
      </ul>
      <h2>六、信息保存</h2>
      <p>我们在实现处理目的所需的最短期限内保存信息。账号存续期间，我们会保存提供服务所需的账号和配置数据；当你删除账号、删除备份或相关目的已经实现后，我们会在合理期限内删除或匿名化信息，但法律要求保留、安全审计、争议处理和备份轮换所需的信息除外。</p>
      <h2>七、信息安全</h2>
      <p>我们采用访问控制、密码哈希、传输保护、日志审计、权限隔离和备份等合理措施保护信息。互联网环境不存在绝对安全，请妥善保管账号凭据，不要与他人共享验证码或密码。如发现账号异常，请立即退出相关会话并通过产品内反馈渠道联系我们。</p>
      <h2>八、你的权利</h2>
      <p>在适用法律允许的范围内，你可以访问、更正、复制或删除个人信息，撤回授权，注销账号，删除云备份，或对信息处理提出询问和投诉。部分权利可以直接通过产品设置完成；暂未提供自助入口的，可以通过产品内反馈渠道联系我们。撤回授权不影响撤回前基于授权进行处理的合法性。</p>
      <h2>九、未成年人保护</h2>
      <p>如果你是未满适用法律规定年龄的未成年人，请在监护人指导和同意下使用本服务。我们不会明知故意收集不必要的未成年人个人信息；如发现相关信息未经适当同意被提交，我们会在核实后尽快处理。</p>
      <h2>十、跨境处理</h2>
      <p>第三方基础设施或你主动选择的外部服务可能位于你所在国家或地区之外。发生跨境处理时，我们将根据适用法律采取合理保护措施。你访问第三方服务时，由该第三方负责说明其跨境处理安排。</p>
      <h2>十一、政策更新</h2>
      <p>我们可能根据功能、业务或法律要求更新本政策。普通文字修订会提示你查看；涉及处理目的、信息类型、共享对象或用户权利的实质性变更，将通过显著提示要求你重新确认。历史版本会被保留以供查阅。</p>
      <h2>十二、联系我们</h2>
      <p>如对本政策或个人信息处理有疑问、建议或投诉，请通过 Search Next 产品内提供的反馈渠道联系我们。我们会在核实身份和请求范围后，于合理期限内处理。</p>
    `,
    "en-US": `
      <p><strong>Effective date: the publication date displayed on this page</strong></p>
      <p>Welcome to Search Next. We value your privacy and the security of your personal information. This Privacy Policy explains how information is collected, used, retained, shared, and protected when you use Search Next websites, accounts, desktop configuration, search, backup, and related features, and how you may exercise your rights.</p>
      <h2>1. Scope</h2>
      <p>This Policy applies to the web, account, and related online services provided by Search Next. Third-party websites, search engines, applications, and services linked from or integrated with Search Next are independently operated and governed by their own privacy policies.</p>
      <h2>2. Information We Process</h2>
      <h3>2.1 Account and identity information</h3>
      <p>When you register or sign in, we may process your username, email address, hashed password, verification result, invitation code, account status, roles and permissions, registration time, and sign-in time. Passwords are stored using one-way hashing; we do not store plaintext passwords.</p>
      <h3>2.2 Security and operational logs</h3>
      <p>To protect accounts and services, troubleshoot issues, and prevent abuse, we may process IP addresses, browser type, User-Agent, device and operating-system information, access times, request logs, error information, sessions, and security-verification results.</p>
      <h3>2.3 Configuration, preferences, and user data</h3>
      <p>When you use desktop layouts, themes, wallpapers, apps, widgets, shortcuts, search preferences, history, developer settings, or backup features, we process the relevant configuration as needed. Some data remains only in your browser. Data is sent to our servers only when you sign in, synchronize, create a cloud backup, or use a feature that requires server-side storage.</p>
      <h3>2.4 Search and third-party navigation</h3>
      <p>When you use search suggestions, third-party search engines, or external applications, queries, destination addresses, or necessary request information may be sent to the third party you select. Their processing is governed by their privacy policies. Do not include passwords, government identifiers, payment information, or other sensitive data in search queries.</p>
      <h3>2.5 Feedback and communications</h3>
      <p>When you contact us through in-product feedback channels, we process the content, contact details, screenshots, and diagnostic information you choose to provide so that we can respond and resolve issues.</p>
      <h2>3. How We Use Information</h2>
      <ul>
        <li>to create, verify, and maintain accounts and provide sign-in, synchronization, and backup;</li>
        <li>to store and restore configuration and data you submit;</li>
        <li>to provide search, apps, widgets, themes, and other product features;</li>
        <li>to detect fraud, attacks, suspicious sign-ins, and violations of the Terms of Service;</li>
        <li>to diagnose errors, improve performance and experience, and provide support; and</li>
        <li>to comply with law and protect users, the public, and the service.</li>
      </ul>
      <p>We process information only to the extent necessary for clear and legitimate purposes. We do not sell personal information or use it for unrelated purposes.</p>
      <h2>4. Local Storage, Cookies, and Similar Technologies</h2>
      <p>Search Next may use cookies, LocalStorage, SessionStorage, IndexedDB, or similar browser technologies to retain sessions, interface preferences, desktop configuration, read status, and security information. Clearing this data may sign you out, remove preferences, or prevent certain features from functioning correctly.</p>
      <h2>5. Service Providers and Sharing</h2>
      <p>We may use third parties for email delivery, security verification, object storage, content delivery, and search. For example, human verification may be provided by Cloudflare Turnstile. We provide service providers only the information necessary to perform the relevant function and require appropriate protection under applicable law and agreements.</p>
      <p>We do not disclose personal information to unrelated third parties except when you authorize it, when necessary to provide a service you request, when required by lawful governmental or judicial process, or when necessary to protect the rights and safety of users, the public, Search Next, or others.</p>
      <h2>6. Retention</h2>
      <p>We retain information for the shortest period necessary for the relevant purpose. Account and configuration data may be retained while your account remains active. After account deletion, backup deletion, or completion of the relevant purpose, we delete or anonymize information within a reasonable period, except where retention is required for law, security audits, dispute resolution, or backup rotation.</p>
      <h2>7. Security</h2>
      <p>We use reasonable safeguards such as access controls, password hashing, transport protection, audit logging, permission separation, and backups. No internet service is completely secure. Protect your credentials and never share passwords or verification codes. If you suspect unauthorized access, sign out of affected sessions and contact us through the in-product feedback channel.</p>
      <h2>8. Your Rights</h2>
      <p>Subject to applicable law, you may request access, correction, portability, or deletion of personal information, withdraw consent, close your account, delete cloud backups, or raise questions and complaints. Some requests can be completed in product settings; for others, contact us through the in-product feedback channel. Withdrawal does not affect processing lawfully performed before withdrawal.</p>
      <h2>9. Children</h2>
      <p>If you are below the age required by applicable law, use the service only with guidance and consent from a parent or guardian. We do not knowingly collect unnecessary personal information from children. If such information was submitted without appropriate consent, we will address it after verification.</p>
      <h2>10. International Processing</h2>
      <p>Third-party infrastructure or external services you choose may be located outside your country or region. Where cross-border processing occurs, we take reasonable safeguards required by applicable law. Third-party providers are responsible for describing their own international processing.</p>
      <h2>11. Updates to This Policy</h2>
      <p>We may update this Policy as features, operations, or law change. Minor editorial revisions may be presented for review. Material changes involving purposes, categories of information, recipients, or user rights will be prominently disclosed and require renewed confirmation. Historical versions remain available.</p>
      <h2>12. Contact Us</h2>
      <p>For questions, requests, suggestions, or complaints about this Policy or personal-information processing, contact us through the feedback channel provided within Search Next. We will respond within a reasonable period after verifying identity and scope.</p>
    `,
  },
  changeSummary: "首次发布：采用 Search Next 标准隐私政策模板",
};

const termsTemplate: LegalDocumentTemplate = {
  title: {
    "zh-CN": "Search Next 服务条款",
    "en-US": "Search Next Terms of Service",
  },
  content: {
    "zh-CN": `
      <p><strong>生效日期：以本页面显示的发布日期为准</strong></p>
      <p>欢迎使用 Search Next。请在注册、登录或使用本服务前仔细阅读本服务条款。点击同意、注册账号、登录或继续使用服务，即表示你已阅读、理解并同意受本条款及隐私政策约束。</p>
      <h2>一、服务说明</h2>
      <p>Search Next 提供可定制的网页桌面、搜索入口、网站与应用管理、小组件、主题与壁纸、账号、备份、同步及其他相关功能。具体功能可能根据版本、地区、账号状态和运行环境有所不同。</p>
      <p>部分功能由第三方网站、搜索引擎、应用、内容源或基础设施提供。第三方服务由其运营者独立负责，并可能要求你遵守额外条款。</p>
      <h2>二、账号注册与使用资格</h2>
      <p>你应提供真实、准确、有效的信息，并及时维护账号信息。你有责任妥善保管密码、验证码和登录会话，并对账号下发生的活动负责。不得出售、出租、出借、共享账号，或以其他方式协助他人绕过访问限制。</p>
      <p>如果你未达到适用法律规定的独立同意年龄，应在监护人同意和指导下使用服务。代表组织使用服务的，你确认有权使该组织受本条款约束。</p>
      <h2>三、用户配置与内容</h2>
      <p>你保留对自己提交的文字、图片、链接、配置和备份数据依法享有的权利。为了向你提供存储、同步、展示、处理和恢复功能，你授予 Search Next 在提供和改进服务所必需范围内处理这些内容的非独占许可。该许可不允许我们出售你的内容。</p>
      <p>你应确保提交或配置的内容来源合法，不侵犯他人的知识产权、隐私权、名誉权或其他合法权益。请自行保留重要数据副本；云备份和本地存储不应被视为唯一备份方案。</p>
      <h2>四、可接受使用规则</h2>
      <p>你不得利用本服务实施或协助实施以下行为：</p>
      <ul>
        <li>违反法律法规、监管要求、公共秩序或善良风俗；</li>
        <li>传播违法、有害、欺诈、侵权、骚扰、仇恨或恶意内容；</li>
        <li>攻击、扫描、干扰、破坏服务，或绕过权限、限流和安全机制；</li>
        <li>上传病毒、木马、恶意脚本，或未经授权访问账号、设备和数据；</li>
        <li>使用自动化方式大量抓取、注册、请求或消耗资源，影响正常用户；</li>
        <li>冒充他人、伪造来源、诱导披露凭据或从事垃圾信息和欺诈活动；</li>
        <li>利用远程应用、开发者功能或接口执行未经授权的代码和操作；</li>
        <li>侵犯 Search Next、其他用户或第三方的合法权益。</li>
      </ul>
      <h2>五、搜索、链接与第三方服务</h2>
      <p>Search Next 可以展示或打开第三方搜索结果、网站、应用、小组件和内容。我们不控制第三方服务，也不对其内容、可用性、安全性、准确性、收费、数据处理或交易负责。访问第三方服务前，请自行判断风险并阅读其条款和隐私政策。</p>
      <p>第三方名称、商标和内容归相应权利人所有；在 Search Next 中出现不表示我们与其存在赞助、认可或代理关系。</p>
      <h2>六、知识产权</h2>
      <p>除用户内容和第三方内容外，Search Next 服务及其软件、界面、设计、文档、商标和相关成果受知识产权法律保护。未经授权，不得复制、出售、出租、反向工程、移除权利标识或制作实质性衍生产品，但适用开源许可或法律明确允许的情形除外。</p>
      <h2>七、隐私与数据保护</h2>
      <p>我们按照《Search Next 隐私政策》处理个人信息。隐私政策是本条款的重要组成部分。你应避免在公开链接、搜索词、反馈或第三方应用中提交不必要的敏感信息。</p>
      <h2>八、服务变更、维护与可用性</h2>
      <p>我们可能为安全、合规、性能、产品调整或不可抗力原因修改、暂停或终止全部或部分功能，并会在合理可行时提供提示。我们会努力维持服务稳定，但不保证服务始终无中断、无错误或适合所有设备与场景。</p>
      <h2>九、账号限制与终止</h2>
      <p>如果你违反本条款、造成安全风险、侵害他人权益、长期不使用账号，或法律要求我们采取措施，我们可以视情况警告、限制功能、暂停或终止账号，并保存必要的审计记录。紧急安全事件中，我们可能先采取措施后通知。</p>
      <p>你可以停止使用服务并在支持的功能中申请注销账号。终止后，依法应继续有效的知识产权、责任限制、争议解决及其他性质上应存续的条款仍然有效。</p>
      <h2>十、免责声明</h2>
      <p>在法律允许的最大范围内，服务按“现状”和“可用”状态提供。我们不对第三方内容和服务作出保证，也不保证搜索结果、建议、远程应用或用户配置绝对准确、安全、完整或持续可用。你应对重要操作、外部链接、下载内容和数据恢复结果进行独立判断。</p>
      <h2>十一、责任限制</h2>
      <p>在法律允许的最大范围内，对于因网络故障、第三方服务、设备或浏览器问题、用户误操作、不可抗力或未经授权访问导致的间接损失、利润损失、数据损失或业务中断，我们不承担超出法律强制规定范围的责任。本条款不排除法律不得排除或限制的责任。</p>
      <h2>十二、条款更新</h2>
      <p>我们可能根据服务、业务或法律变化更新本条款。普通文字修订会提示你查看；对用户权利义务产生实质影响的更新会通过显著提示要求你重新确认。继续使用服务前，请查看最新版本及变更摘要。</p>
      <h2>十三、适用法律与争议解决</h2>
      <p>本条款适用运营者所在地的法律，但不影响适用法律赋予消费者的强制性权利。发生争议时，双方应先通过产品内反馈渠道友好协商；协商不成的，任何一方可以向依法具有管辖权的人民法院或争议解决机构提出请求。</p>
      <h2>十四、联系我们</h2>
      <p>如对本条款、账号措施或服务使用有疑问、建议或投诉，请通过 Search Next 产品内提供的反馈渠道联系我们。</p>
    `,
    "en-US": `
      <p><strong>Effective date: the publication date displayed on this page</strong></p>
      <p>Welcome to Search Next. Please read these Terms of Service before registering, signing in, or using the service. By accepting, creating an account, signing in, or continuing to use the service, you acknowledge that you have read, understood, and agreed to these Terms and the Privacy Policy.</p>
      <h2>1. The Service</h2>
      <p>Search Next provides a customizable web desktop, search access, website and application management, widgets, themes and wallpapers, accounts, backup, synchronization, and related features. Features may vary by version, region, account status, and operating environment.</p>
      <p>Some features rely on third-party websites, search engines, applications, content providers, or infrastructure. Third-party services are independently operated and may require you to accept additional terms.</p>
      <h2>2. Accounts and Eligibility</h2>
      <p>You must provide accurate and valid information and keep it current. You are responsible for protecting passwords, verification codes, and sessions and for activity under your account. You may not sell, rent, lend, or share accounts or help others circumvent access restrictions.</p>
      <p>If you are below the age of independent consent under applicable law, you may use the service only with consent and guidance from a parent or guardian. If you use the service for an organization, you represent that you are authorized to bind that organization.</p>
      <h2>3. User Configuration and Content</h2>
      <p>You retain the rights you lawfully hold in text, images, links, configuration, and backup data you submit. To provide storage, synchronization, display, processing, and restoration, you grant Search Next a non-exclusive license to process that content only as necessary to provide and improve the service. This license does not permit us to sell your content.</p>
      <p>You must have the right to submit or configure content and must not infringe intellectual-property, privacy, reputation, or other rights. Keep independent copies of important data; cloud backup and browser storage should not be treated as your only backup.</p>
      <h2>4. Acceptable Use</h2>
      <p>You may not use or assist others in using the service to:</p>
      <ul>
        <li>violate law, regulation, public order, or generally accepted standards;</li>
        <li>distribute unlawful, harmful, fraudulent, infringing, harassing, hateful, or malicious content;</li>
        <li>attack, scan, interfere with, or disrupt the service or bypass permissions, rate limits, or security controls;</li>
        <li>upload malware or malicious scripts or access accounts, devices, or data without authorization;</li>
        <li>use automation for excessive scraping, registration, requests, or resource consumption that affects normal users;</li>
        <li>impersonate others, falsify sources, solicit credentials, send spam, or commit fraud;</li>
        <li>use remote applications, developer features, or APIs to execute unauthorized code or operations; or</li>
        <li>infringe the lawful rights of Search Next, other users, or third parties.</li>
      </ul>
      <h2>5. Search, Links, and Third-Party Services</h2>
      <p>Search Next may display or open third-party search results, websites, applications, widgets, and content. We do not control third-party services and are not responsible for their content, availability, security, accuracy, charges, data practices, or transactions. Assess risks and review their terms and privacy policies before use.</p>
      <p>Third-party names, marks, and content belong to their respective owners. Their appearance in Search Next does not imply sponsorship, endorsement, or agency.</p>
      <h2>6. Intellectual Property</h2>
      <p>Except for user and third-party content, the Search Next service, software, interface, designs, documentation, marks, and related materials are protected by intellectual-property law. Unless authorized, you may not copy, sell, rent, reverse engineer, remove rights notices, or create substantially derived products, except as permitted by an applicable open-source license or mandatory law.</p>
      <h2>7. Privacy</h2>
      <p>We process personal information according to the Search Next Privacy Policy, which forms part of these Terms. Avoid submitting unnecessary sensitive information in public links, search queries, feedback, or third-party applications.</p>
      <h2>8. Changes, Maintenance, and Availability</h2>
      <p>We may modify, suspend, or discontinue features for security, compliance, performance, product changes, or events beyond reasonable control, with notice where reasonably practical. We work to maintain reliability but do not guarantee uninterrupted, error-free service or compatibility with every device and scenario.</p>
      <h2>9. Restriction and Termination</h2>
      <p>If you violate these Terms, create security risks, infringe rights, leave an account inactive for an extended period, or if law requires action, we may warn you, restrict features, suspend, or terminate the account and retain necessary audit records. In urgent security situations, action may be taken before notice.</p>
      <p>You may stop using the service and request account closure where supported. Provisions concerning intellectual property, limitations of liability, dispute resolution, and any terms that by nature should survive remain effective after termination.</p>
      <h2>10. Disclaimers</h2>
      <p>To the maximum extent permitted by law, the service is provided “as is” and “as available.” We make no warranties regarding third-party content or services and do not guarantee that search results, suggestions, remote applications, or user configurations are always accurate, secure, complete, or available. Independently assess important actions, external links, downloads, and restoration results.</p>
      <h2>11. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, we are not liable beyond mandatory legal requirements for indirect loss, lost profits, data loss, or business interruption caused by network failures, third-party services, devices or browsers, user error, force majeure, or unauthorized access. Nothing in these Terms excludes liability that cannot lawfully be excluded or limited.</p>
      <h2>12. Updates to These Terms</h2>
      <p>We may update these Terms as the service, operations, or law changes. Minor editorial revisions may be presented for review. Material changes affecting user rights or obligations will be prominently disclosed and require renewed confirmation. Review the latest version and change summary before continuing.</p>
      <h2>13. Governing Law and Disputes</h2>
      <p>These Terms are governed by the law applicable where the operator is located, without limiting mandatory consumer rights. The parties should first attempt to resolve disputes through the in-product feedback channel. If resolution is not possible, either party may submit the dispute to a court or dispute-resolution body with lawful jurisdiction.</p>
      <h2>14. Contact</h2>
      <p>For questions, suggestions, or complaints concerning these Terms, account actions, or use of the service, contact us through the feedback channel provided within Search Next.</p>
    `,
  },
  changeSummary: "首次发布：采用 Search Next 标准服务条款模板",
};

const templates: Record<LegalDocumentType, LegalDocumentTemplate> = {
  terms: termsTemplate,
  privacy: privacyTemplate,
};

export const getLegalDocumentTemplate = (
  type: LegalDocumentType,
): LegalDocumentTemplate => {
  const template = templates[type];
  return {
    title: { ...template.title },
    content: {
      "zh-CN": normalizeLegalDocumentContent(template.content["zh-CN"]),
      "en-US": normalizeLegalDocumentContent(template.content["en-US"]),
    },
    changeSummary: template.changeSummary,
  };
};
