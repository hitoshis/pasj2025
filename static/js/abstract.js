document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("program-table");
    const categorySelect = document.getElementById("categoryFilter");
    const sessionSelect = document.getElementById("sessionFilter");
    const dateSelect = document.getElementById("dateFilter");

    let allData = [];

    fetch("data/abstract.json")
        .then(response => response.json())
        .then(data => {
            allData = data;

            // カテゴリ収集とセッション収集
            const categorySet = new Set();
            const sessionSet = new Set();
            const dateSet = new Set();

            data.forEach(entry => {
                const cat = entry.category_1 || "施設現状報告";
                categorySet.add(cat);

                const session = entry.session || "未分類セッション";
                sessionSet.add(session);

                const date = entry.date || "未定";
                dateSet.add(date);
            });

            // カテゴリ追加
            Array.from(categorySet).sort((a, b) => {
                const aKey = (a || "").trim();
                const bKey = (b || "").trim();
                if (!aKey) return 1;
                if (!bKey) return -1;
                const aNum = aKey.match(/\d+/);
                const bNum = bKey.match(/\d+/);
                if (!aNum || !bNum) return aKey.localeCompare(bKey, "ja");
                return parseInt(aNum[0]) - parseInt(bNum[0]);
            }).forEach(cat => {
                const opt = document.createElement("option");
                const value = (cat || "").trim();
                opt.value = value;
                opt.textContent = value || "施設現状報告";
                categorySelect.appendChild(opt);
            });

            // セッション追加
            Array.from(sessionSet).sort((a, b) => a.localeCompare(b, "ja")).forEach(sess => {
                const opt = document.createElement("option");
                opt.value = sess;
                opt.textContent = sess;
                sessionSelect.appendChild(opt);
            });
            // 日付追加
            Array.from(dateSet).sort().forEach(date => {
                const opt = document.createElement("option");
                opt.value = date;
                opt.textContent = date;
                dateSelect.appendChild(opt);
            });
            //renderSummaryTable(allData);
            renderTable("ALL", "ALL", "ALL");

            categorySelect.addEventListener("change", () => {
                renderTable(categorySelect.value, sessionSelect.value, dateSelect.value);
            });

            sessionSelect.addEventListener("change", () => {
                renderTable(categorySelect.value, sessionSelect.value, dateSelect.value);
            });

            dateSelect.addEventListener("change", () => {
                renderTable(categorySelect.value, sessionSelect.value, dateSelect.value);
            });
        })
        .catch(error => {
            table.innerHTML = "<tr><td colspan='2'>プログラムの取得に失敗しました。</td></tr>";
            console.error("Fetch error:", error);
        });

    function renderTable(categoryFilter, sessionFilter, dateFilter) {
        table.innerHTML = "";

        allData.forEach(entry => {
            const category = (entry.category_1 || "").trim();
            const session = entry.session || "未分類セッション";
            const date = entry.date || "未定";

            if ((categoryFilter !== "ALL" && category !== categoryFilter) ||
                (sessionFilter !== "ALL" && session !== sessionFilter) ||
                (dateFilter !== "ALL" && date !== dateFilter)) {
                return;
            }

            const code = entry.talk_id || "NoCode";
            const title = entry.title_ja || "タイトル未定";
            const authors = entry.coauthors || [];

            const talkRow = document.createElement("tr");
            const abstractId = `abstract-${code}`;
            const abstract = entry.abstract_ja || "（要旨なし）";

            talkRow.innerHTML = `
              <td valign="top" width="50" nowrap>
                <b>${code}</b><br>
              </td>
              <td valign="top" align="left" width="100%">
                <a href="#" onclick="toggleAbstract('${abstractId}'); return false;"><b>${title}</b></a><br>
                ${renderAuthorsWithSuperscript(authors)}
                <div id="${abstractId}" style="display: none; margin-top: 0.5em;">
                  <b>要旨：</b><br>${abstract}
                </div>
              </td>
            `;

            table.appendChild(talkRow);
        });
    }
/*
    function renderSummaryTable(data) {
        const table = document.getElementById("summary-table").querySelector("tbody");
        table.innerHTML = "";

        const categoryCount = new Map();
        let total = 0;

        data.forEach(entry => {
            const cat = entry.category_1 || "施設現状報告";
            categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
            total++;
        });

        const totalRow = document.createElement("tr");
        totalRow.innerHTML = `<td><b>総件数</b></td><td><b>${total}</b></td>`;
        table.appendChild(totalRow);

        Array.from(categoryCount.entries())
            .sort((a, b) => {
                const aKey = (a[0] || "").trim();
                const bKey = (b[0] || "").trim();
                if (!aKey) return 1;
                if (!bKey) return -1;
                const aMatch = aKey.match(/\d+/);
                const bMatch = bKey.match(/\d+/);
                if (!aMatch || !bMatch) return aKey.localeCompare(bKey, "ja");
                return parseInt(aMatch[0]) - parseInt(bMatch[0]);
            })
            .forEach(([cat, count]) => {
                const row = document.createElement("tr");
                const displayCat = (cat || "").trim() || "施設現状報告";
                row.innerHTML = `<td>${displayCat}</td><td>${count}</td>`;
                table.appendChild(row);
            });
    }
*/
    function renderAuthorsWithSuperscript(authors) {
        const affiliationMap = new Map();
        let affCounter = 1;

        const authorsHtml = authors.map(a => {
            if (!a.last_name || !a.first_name) return "";
            const mark = a.role && a.role.includes("登壇") ? "○" : "";
            const name = a.last_name + " " + a.first_name;
            const aff = (a.affiliation || "").trim();

            let affIndex = "";
            if (aff) {
                if (!affiliationMap.has(aff)) {
                    affiliationMap.set(aff, affCounter++);
                }
                affIndex = `<sup>${affiliationMap.get(aff)}</sup>`;
            }

            return `${mark}${name}${affIndex}`;
        }).filter(Boolean).join(", ");

        const affHtml = Array.from(affiliationMap.entries())
            .map(([aff, idx]) => `<sup>${idx}</sup>${aff}`)
            .join(", ");

        return authorsHtml + "<br>" + affHtml + "<br>";
    }
});

function toggleAbstract(id) {
    const elem = document.getElementById(id);
    elem.style.display = (elem.style.display === "none") ? "block" : "none";
}
