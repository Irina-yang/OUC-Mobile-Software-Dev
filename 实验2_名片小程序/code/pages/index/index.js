Page({
  data: {
    name: "杨伊婷",
    school: "中国海洋大学",
    major: "网络空间安全",
    email: "17852422996@163.com",
    github: "Irina-yang",
    tags: ["独立女摄", "信印象新媒体", "机器学习", "C++ / Java"],
    
    baikeList: [
      {
        category: "社团与社会实践",
        items: [
          "担任信息学部“信印象”新媒体社团负责人：统筹部门招新与宣传流程，主导编制涵盖四校区的校园服务指南，并基于腾讯文档智能表格搭建社团年度项目日历与协作数据库。",
          "参与星辰支教队“三下乡”暑期实践：前往山东广饶县开展支教活动，为学生设计并讲授摩斯密码等趣味安全课程，并负责撰写媒体新闻通稿。"
        ]
      },
      {
        category: "专业技能与项目研发",
        items: [
          "深度学习与AI安全探究：熟练运用 PyTorch 框架，曾构建 SimpleCNN 模型完成手写数字识别，搭建 HuffmanMLP 模型评估预测性能；曾系统调研并撰写 LLM Agent Security 学术文献综述。",
          "密码学与底层算法实现：基于 C++ 独立完成 RSA 数字信封封装、MD5 摘要算法，以及哈希表、最小生成树等复杂数据结构与图论算法的设计与验证。"
        ]
      },
      {
        category: "个人特长与生活探索",
        items: [
          "小红书独立女摄：长期提供风格化约拍与陪拍服务，具备出色的审美与人际沟通能力。",
          "人文视野与田野调查：曾赴青岛大鲍岛文化街区（里院、劈柴院等地）开展实地走访与人文历史调研。"
        ]
      }
    ]
  }, 

  onLoad: function (options) {
  },

  // 1. 发送给微信好友
  onShareAppMessage: function () {
    return {
      title: '你好，我是杨伊婷！这是我的专属电子名片',
      path: '/pages/index/index',
      imageUrl: '/images/header.jpg'
    }
  },

  // 2. 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: '很高兴认识你！点击查看我的专属电子名片',
      query: '', 
      imageUrl: '/images/header.jpg' 
    }
  }
})